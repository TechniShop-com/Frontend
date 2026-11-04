import unittest
from unittest.mock import patch

from production_smoke import required_environment, validate_catalog


class Response:
    def __init__(self, ok, status, body):
        self.ok = ok
        self.status = status
        self.body = body

    def json(self):
        return self.body


class CatalogChecks(unittest.TestCase):
    def test_rejects_failed_supabase_request(self):
        with self.assertRaisesRegex(AssertionError, 'HTTP 503'):
            validate_catalog(Response(False, 503, []))

    def test_rejects_empty_or_invalid_catalog(self):
        for body in ([], {}, [{'title': ''}]):
            with self.subTest(body=body), self.assertRaises(AssertionError):
                validate_catalog(Response(True, 200, body))

    def test_accepts_actual_product_title(self):
        self.assertEqual(validate_catalog(Response(True, 200, [{'title': 'Koszulka'}])), ['Koszulka'])

    def test_missing_configuration_fails_closed(self):
        with patch.dict('os.environ', {}, clear=True), self.assertRaisesRegex(RuntimeError, 'TEST_MISSING'):
            required_environment('TEST_MISSING')


if __name__ == '__main__':
    unittest.main()
