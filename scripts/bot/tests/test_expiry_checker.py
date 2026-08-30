"""
Unit tests for LinkedIn Expiry Checker (linkedin_expiry_checker.py).
"""

from __future__ import annotations

import unittest
from unittest.mock import MagicMock, patch
import requests

import linkedin_expiry_checker as checker
from db import StoredJob


class DummyResponse:
    def __init__(self, status_code: int = 200, text: str = "", url: str = "https://www.linkedin.com/jobs/view/12345"):
        self.status_code = status_code
        self.text = text
        self.url = url


class TestLinkedInExpiryChecker(unittest.TestCase):

    def setUp(self):
        self.session = MagicMock(spec=requests.Session)

    def test_check_linkedin_job_empty_id(self):
        result = checker.check_linkedin_job("", session=self.session)
        self.assertEqual(result, checker.RESULT_UNKNOWN)
        self.session.get.assert_not_called()

    def test_check_linkedin_job_active(self):
        active_html = """
        <html>
            <head><title>Backend Engineer at Acme</title></head>
            <body>
                <h1>Backend Engineer</h1>
                <div class="description">We are hiring a Senior Backend Engineer...</div>
                <button class="apply-button">Apply now</button>
            </body>
        </html>
        """
        self.session.get.return_value = DummyResponse(
            status_code=200,
            text=active_html,
            url="https://www.linkedin.com/jobs/view/1234567890",
        )

        result = checker.check_linkedin_job("1234567890", session=self.session)
        self.assertEqual(result, checker.RESULT_ACTIVE)

    def test_check_linkedin_job_expired_by_html_marker(self):
        closed_markers = [
            "No longer accepting applications",
            "This job is no longer accepting applications",
            "Job is no longer available",
            "Expired",
            "Application deadline has passed",
        ]
        for marker in closed_markers:
            html = f"<html><body><div>{marker}</div></body></html>"
            self.session.get.return_value = DummyResponse(
                status_code=200,
                text=html,
                url="https://www.linkedin.com/jobs/view/1234567890",
            )
            result = checker.check_linkedin_job("1234567890", session=self.session)
            self.assertEqual(result, checker.RESULT_EXPIRED, f"Failed for marker: {marker}")

    def test_check_linkedin_job_expired_by_redirect(self):
        redirect_urls = [
            "https://www.linkedin.com/jobs/search?currentJobId=123",
            "https://www.linkedin.com/authwall?trk=123",
            "https://www.linkedin.com/login",
            "https://www.linkedin.com/checkpoint/lg/login-submit",
        ]
        for redirect_url in redirect_urls:
            self.session.get.return_value = DummyResponse(
                status_code=200,
                text="<html><body>Redirected</body></html>",
                url=redirect_url,
            )
            result = checker.check_linkedin_job("1234567890", session=self.session)
            self.assertEqual(result, checker.RESULT_EXPIRED, f"Failed for redirect URL: {redirect_url}")

    def test_check_linkedin_job_expired_by_404(self):
        self.session.get.return_value = DummyResponse(
            status_code=404,
            text="Not Found",
            url="https://www.linkedin.com/jobs/view/1234567890",
        )
        result = checker.check_linkedin_job("1234567890", session=self.session)
        self.assertEqual(result, checker.RESULT_EXPIRED)

    def test_check_linkedin_job_unknown_on_429_rate_limit(self):
        self.session.get.return_value = DummyResponse(
            status_code=429,
            text="Too Many Requests",
            url="https://www.linkedin.com/jobs/view/1234567890",
        )
        result = checker.check_linkedin_job("1234567890", session=self.session)
        self.assertEqual(result, checker.RESULT_UNKNOWN)

    def test_check_linkedin_job_unknown_on_500_server_error(self):
        self.session.get.return_value = DummyResponse(
            status_code=500,
            text="Internal Server Error",
            url="https://www.linkedin.com/jobs/view/1234567890",
        )
        result = checker.check_linkedin_job("1234567890", session=self.session)
        self.assertEqual(result, checker.RESULT_UNKNOWN)

    def test_check_linkedin_job_unknown_on_connection_error(self):
        self.session.get.side_effect = requests.RequestException("Network timeout")
        result = checker.check_linkedin_job("1234567890", session=self.session)
        self.assertEqual(result, checker.RESULT_UNKNOWN)

    def test_clean_html(self):
        raw = "<div><p>Hello &amp; World</p>   <span>Test</span></div>"
        cleaned = checker._clean_html(raw)
        self.assertEqual(cleaned, "Hello & World Test")

    def test_extract_job_id_from_url(self):
        urls = [
            ("https://www.linkedin.com/jobs/view/1234567890", "1234567890"),
            ("https://www.linkedin.com/jobs/view/software-engineer-at-acme-9876543210?trk=1", "9876543210"),
            ("https://eg.linkedin.com/jobs/view/1122334455/", "1122334455"),
            ("https://invalid-url.com/about", ""),
        ]
        for url, expected in urls:
            self.assertEqual(checker._extract_job_id_from_url(url), expected)

    @patch("linkedin_expiry_checker.connect")
    @patch("linkedin_expiry_checker.purge_jobs_older_than_two_weeks")
    @patch("linkedin_expiry_checker.get_jobs_due_for_weekly_check")
    @patch("linkedin_expiry_checker.check_linkedin_job")
    def test_run_expiry_check_dry_run(self, mock_check, mock_get_jobs, mock_purge, mock_connect):
        mock_conn = MagicMock()
        mock_connect.return_value.__enter__.return_value = mock_conn

        stored = StoredJob(
            id=1,
            source="linkedin",
            source_job_id="12345",
            title="Dev",
            company="Acme",
            location="Cairo",
            url="https://www.linkedin.com/jobs/view/12345",
            canonical_url="https://www.linkedin.com/jobs/view/12345",
            salary="",
            job_type="",
            tags=[],
            is_remote=False,
            original_source="",
            content_hash="hash1",
            send_status="sent",
            first_seen_at="2026-08-01T00:00:00Z",
            last_seen_at="2026-08-01T00:00:00Z",
            is_active=True,
            last_checked_at=None,
        )
        mock_get_jobs.return_value = [stored]
        mock_check.return_value = checker.RESULT_EXPIRED

        summary = checker.run_expiry_check(dry_run=True, request_delay=0)

        self.assertEqual(summary["checked"], 1)
        self.assertEqual(summary[checker.RESULT_EXPIRED], 1)
        self.assertEqual(summary["purged_old_jobs"], 0)
        # In dry run, db updates should be skipped
        mock_purge.assert_not_called()
        mock_conn.commit.assert_not_called()


if __name__ == "__main__":
    unittest.main()
