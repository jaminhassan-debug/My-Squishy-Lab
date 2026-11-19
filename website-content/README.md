# Publishing blog posts

Edit posts.json to add a new article. Each article has a unique lowercase hyphenated slug, title, description, category, ISO date, existing image path and sections. Each section is a pair containing its heading and paragraph.

Run python3 scripts/build-website.py from the repository root. The script generates the homepage blog cards, blog index, individual article pages and sitemap.xml. Commit and push the content and generated files together to publish them.

Official store links belong in the download page content in scripts/build-website.py once the published listings are available. Search Console ownership must be verified in the publisher's Google account. Submit https://mysquishylab.app/sitemap.xml in that property's Sitemaps report.
