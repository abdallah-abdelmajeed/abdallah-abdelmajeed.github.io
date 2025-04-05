# Complete Setup Guide for Personal Website

## Part 1: Setting Up GitHub Pages at Root Domain

To get a shorter URL for your website (without needing a custom domain), you can use GitHub's user pages feature. This will give you a URL like `https://abdallah-abdelmajeed.github.io/` instead of the current longer URL.

### Steps to Set Up GitHub Pages at Root Domain

1. **Create a Special Repository**:
   - Create a new GitHub repository named exactly `abdallah-abdelmajeed.github.io`
   - The repository name MUST match your GitHub username exactly, followed by `.github.io`
   - This special repository will be published at the root domain

2. **Copy Your Static Site Files**:
   - Clone the new repository to your local machine
   - Copy all files from the `static-site` directory to the root of the new repository
   - Make sure to include all HTML, CSS, JavaScript, images, and other assets

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

## Part 2: Fixing the Empty CV Download Issue

The current CV file in your website is just a placeholder with minimal text and is only 28 bytes in size. This is why the CV download button is downloading an empty PDF.

### Steps to Fix the CV Issue

1. **Locate the Current Placeholder Files**:
   - The placeholder CV is located in two places:
     - `static-site/assets/abdallah-abdelmajeed-cv.pdf`
     - `public/abdallah-abdelmajeed-cv.pdf`

2. **Create or Prepare Your Actual CV**:
   - Create your CV in PDF format
   - Make sure it contains your complete and up-to-date information
   - Ensure the file is properly formatted and readable

3. **Replace the Placeholder Files**:
   - Replace both placeholder files with your actual CV
   - Make sure to keep the same filename to maintain all existing links
   - When copying files to your new root domain repository, be sure to include this updated CV

4. **Verify the File Size**:
   - Check that the new PDF file size is appropriate (typically at least several hundred KB)
   - A file size of only a few bytes indicates the file might still be empty or corrupted

5. **Test the Download**:
   - Open your website after deployment
   - Click on the CV download button
   - Verify that the correct and complete CV is downloaded

## Important Notes

- You can only have one user site per GitHub account
- The repository must be public for GitHub Pages to work (unless you have GitHub Pro)
- If you still want to use a custom domain later, you can configure it in the GitHub Pages settings of this new repository
- Keep your CV updated regularly to reflect your latest achievements and experience

## Alternative: Using a Custom Domain

If you prefer to use a custom domain instead of the GitHub Pages domain, refer to the existing SETUP_INSTRUCTIONS.md file for detailed steps on setting up a custom domain.