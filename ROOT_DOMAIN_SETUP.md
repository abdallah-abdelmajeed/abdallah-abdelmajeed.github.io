# Setting Up GitHub Pages at Root Domain

To get a shorter URL for your website (without needing a custom domain), you can use GitHub's user pages feature. This will give you a URL like `https://abdallah-abdelmajeed.github.io/` instead of the current `https://abdallah-abdelmajeed.github.io/personal-website-static/`.

## Steps to Set Up GitHub Pages at Root Domain

1. **Create a Special Repository**:
   - Create a new GitHub repository named exactly `abdallah-abdelmajeed.github.io`
   - The repository name MUST match your GitHub username exactly, followed by `.github.io`
   - This special repository will be published at the root domain

2. **Copy Your Static Site Files**:
   - Clone the new repository to your local machine
   - Copy all files from the `static-site` directory to the root of the new repository
   - Make sure to include all HTML, CSS, JavaScript, images, and other assets
   - Don't forget to copy the CV file from `static-site/assets/abdallah-abdelmajeed-cv.pdf`

3. **Update Any Relative Links** (if necessary):
   - Check if any links in your HTML files need to be updated
   - Since the files will now be at the root, you might need to adjust some paths

4. **Commit and Push**:
   - Add all files to the new repository
   - Commit the changes
   - Push to the main branch of your new repository

5. **Configure GitHub Pages**:
   - Go to the repository settings
   - Navigate to the 'Pages' section
   - Ensure the source is set to 'Deploy from a branch'
   - Select the 'main' branch and '/ (root)' folder
   - Click 'Save'

6. **Wait for Deployment**:
   - GitHub will automatically build and deploy your site
   - This usually takes a few minutes
   - You can check the status in the 'Actions' tab of your repository

7. **Access Your New Site**:
   - Once deployed, your site will be available at `https://abdallah-abdelmajeed.github.io/`
   - This is much shorter and more user-friendly than the previous URL

## Important Notes

- You can only have one user site per GitHub account
- The repository must be public for GitHub Pages to work (unless you have GitHub Pro)
- If you still want to use a custom domain later, you can configure it in the GitHub Pages settings of this new repository

## Fixing the CV Download

Don't forget to also fix the CV download issue by replacing the placeholder file with your actual CV as mentioned in the other setup instructions.