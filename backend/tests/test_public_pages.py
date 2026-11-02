"""Public website navigation and search metadata regressions."""

from html.parser import HTMLParser
import json
import re

from app.api.v1.endpoints.legal import marketing_page, privacy_policy, support_page


class PageMetadata(HTMLParser):
    def __init__(self):
        super().__init__()
        self.home_links = []
        self.canonicals = []
        self.descriptions = []
        self.in_header = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "header":
            self.in_header = True
        if self.in_header and tag == "a" and attrs.get("class") == "brand":
            self.home_links.append(attrs)
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonicals.append(attrs.get("href"))
        if tag == "meta" and attrs.get("name") == "description":
            self.descriptions.append(attrs.get("content"))

    def handle_endtag(self, tag):
        if tag == "header":
            self.in_header = False


def test_public_pages_have_consistent_home_link_and_metadata():
    for page, canonical in (
        (marketing_page(), "https://drivededuckly.com"),
        (support_page(), "https://drivededuckly.com/support"),
        (privacy_policy(), "https://drivededuckly.com/privacy"),
    ):
        parsed = PageMetadata()
        parsed.feed(page)
        assert len(parsed.home_links) == 1
        assert parsed.home_links[0]["href"] == "https://drivededuckly.com/"
        assert parsed.home_links[0]["aria-label"] == "Deduckly home"
        assert parsed.canonicals == [canonical]
        assert len(parsed.descriptions) == 1 and parsed.descriptions[0]


def test_shift_mode_copy_matches_active_session_and_search_data():
    page = marketing_page()
    assert "Start a shift when you begin work" in page
    assert "Automatic drive detection is tied to an active Shift Mode session" in page
    assert "Manual trip tracking starts only when you start a trip" in page
    payload = re.search(r'<script type="application/ld\+json">(.*?)</script>', page, re.S)
    assert payload is not None
    data = json.loads(payload.group(1))
    assert any("Shift Mode" in feature for feature in data["featureList"])
