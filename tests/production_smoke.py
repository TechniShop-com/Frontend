import os
from urllib.parse import urljoin

from playwright.sync_api import sync_playwright


BASE_URL = os.getenv("TECHNISHOP_URL", "https://technishop-frontend.vercel.app").rstrip("/")


def check_page(page, path: str, expected_text: str) -> None:
    response = page.goto(urljoin(BASE_URL + "/", path.lstrip("/")), wait_until="networkidle")
    assert response is not None and response.ok, f"{path} returned {response.status if response else 'no response'}"
    assert expected_text in page.locator("body").inner_text(), f"Missing text {expected_text!r} on {path}"


def main() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_default_timeout(15_000)

        check_page(page, "/", "TechniShop")
        check_page(page, "/products", "Produkty")
        check_page(page, "/login", "Logowanie")

        page.goto(urljoin(BASE_URL + "/", "products"), wait_until="networkidle")
        product_title = page.locator("h3").first
        assert product_title.count() > 0, "No product cards found"
        product_title.click()
        page.wait_for_load_state("networkidle")
        assert "/product/" in page.url
        assert page.locator("body").inner_text().strip(), "Product page is empty"

        browser.close()


if __name__ == "__main__":
    main()
    print(f"Production smoke tests passed: {BASE_URL}")
