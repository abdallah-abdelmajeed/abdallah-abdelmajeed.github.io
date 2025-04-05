# Setup Instructions for Personal Website

## Fixing the Empty CV Download Issue

The current CV files in both the `public` and `static-site/assets` directories are just placeholders with the text "[CV content would be here]" and are only 28 bytes in size. This is why the CV download button is downloading an empty PDF.

### Steps to Fix:

1. Create or obtain your actual CV in PDF format
2. Replace the placeholder file at `static-site/assets/abdallah-abdelmajeed-cv.pdf` with your actual CV file
3. Make sure to keep the same filename to maintain all existing links
4. Verify the file size is appropriate for a PDF document (typically at least several hundred KB)

## Setting Up a Custom Domain for a Shorter URL

Currently, your website is accessible at `https://abdallah-abdelmajeed.github.io/personal-website-static/`, which is quite long and not user-friendly. You can set up a custom domain for a shorter, more memorable URL.

### Steps to Set Up a Custom Domain:

1. **Purchase a Domain Name**:
   - Choose a domain registrar (GoDaddy, Namecheap, Google Domains, etc.)
   - Purchase a domain name (e.g., `abdallah-abdelmajeed.com` or similar)

2. **Configure DNS Settings**:
   - Go to your domain registrar's DNS settings
   - Add the following DNS records:
     - Type: A, Name: @, Value: 185.199.108.153
     - Type: A, Name: @, Value: 185.199.109.153
     - Type: A, Name: @, Value: 185.199.110.153
     - Type: A, Name: @, Value: 185.199.111.153
     - Type: CNAME, Name: www, Value: abdallah-abdelmajeed.github.io

3. **Configure GitHub Pages**:
   - Go to your GitHub repository (personal-website-static)
   - Click on 'Settings'
   - Scroll down to 'GitHub Pages' section
   - Under 'Custom domain', enter your domain name (e.g., `abdallah-abdelmajeed.com`)
   - Check 'Enforce HTTPS' for secure connections
   - Click 'Save'

4. **Wait for DNS Propagation**:
   - DNS changes can take up to 48 hours to propagate globally
   - GitHub will verify your domain ownership during this time

5. **Verify Setup**:
   - Once DNS propagation is complete, visit your custom domain
   - Ensure the website loads correctly and the HTTPS padlock appears

Note: A CNAME file has already been created in your repository with the suggested domain name. You'll need to update this if you choose a different domain name.

## Additional Resources

- [GitHub Pages Custom Domain Documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Troubleshooting Custom Domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages)