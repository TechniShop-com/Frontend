import os
from urllib.parse import urljoin, urlsplit

from playwright.sync_api import sync_playwright


def required_environment(name: str) -> str:
    value = os.environ.get(name, '').strip()
    if not value:
        raise RuntimeError(f'Missing required environment variable: {name}')
    return value.rstrip('/')


def validate_catalog(response):
    if not response.ok:
        raise AssertionError(f'Supabase product request returned HTTP {response.status}')
    rows = response.json()
    if not isinstance(rows, list) or not rows:
        raise AssertionError('Supabase returned an empty or invalid product catalog')
    titles = [row.get('title') for row in rows if isinstance(row, dict) and isinstance(row.get('title'), str) and row['title'].strip()]
    if not titles:
        raise AssertionError('Supabase returned no products with a valid title')
    return titles


def main() -> None:
    base_url = required_environment('TECHNISHOP_URL')
    supabase_url = required_environment('VITE_SUPABASE_URL')
    required_environment('VITE_SUPABASE_PUBLISHABLE_KEY')
    api = urlsplit(supabase_url)
    if api.scheme != 'https' or not api.hostname or api.hostname.endswith('.example.com') or 'mock' in api.hostname or 'placeholder' in api.hostname:
        raise RuntimeError('VITE_SUPABASE_URL must identify a real HTTPS Supabase project')

    def catalog_response(response):
        url = urlsplit(response.url)
        return url.scheme == api.scheme and url.netloc == api.netloc and url.path == '/rest/v1/Product' and response.request.method == 'GET'

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            page = browser.new_page()
            page.set_default_timeout(20_000)
            response = page.goto(urljoin(base_url + '/', ''), wait_until='domcontentloaded')
            assert response and response.ok, 'Home page did not return a successful HTTP response'
            page.get_by_text('TechniShop', exact=False).first.wait_for(state='visible')

            # Fallback cards may appear before Supabase responds; do not count them as success.
            with page.expect_response(catalog_response, timeout=30_000) as request:
                response = page.goto(urljoin(base_url + '/', 'products'), wait_until='domcontentloaded')
            assert response and response.ok, 'Products page did not return a successful HTTP response'
            titles = validate_catalog(request.value)
            page.get_by_text('Produkty', exact=False).first.wait_for(state='visible')
            title = page.get_by_role('heading', name=titles[0], exact=True).first
            title.wait_for(state='visible')
            title.click()
            page.wait_for_url('**/product/**')
            page.get_by_role('heading', name=titles[0], exact=True).first.wait_for(state='visible')

            response = page.goto(urljoin(base_url + '/', 'login'), wait_until='domcontentloaded')
            assert response and response.ok, 'Login page did not return a successful HTTP response'
            page.get_by_text('Logowanie', exact=False).first.wait_for(state='visible')
        finally:
            browser.close()
    print('Smoke checks passed for the built app and real Supabase product catalog')


if __name__ == '__main__':
    main()
