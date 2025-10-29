# Netlify Deployment Guide

This guide provides detailed instructions for deploying the Ad Placement Analyzer to Netlify.

## Prerequisites

- GitHub account
- Netlify account (sign up at https://netlify.com)
- OpenAI API key

## Deployment Steps

### 1. Push Code to GitHub

If you haven't already, push this repository to GitHub:

```bash
git add .
git commit -m "Migrate to Netlify Functions"
git push origin main
```

### 2. Connect Repository to Netlify

1. Log in to [Netlify](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select your repository from the list

### 3. Configure Build Settings

On the deployment configuration screen:

- **Branch to deploy**: `main` (or your default branch)
- **Build command**: Leave empty or use `npm install`
- **Publish directory**: `.`
- **Functions directory**: `netlify/functions`

Click **"Deploy site"**

### 4. Set Environment Variables

After the initial deployment:

1. Go to **Site settings** → **Environment variables**
2. Click **"Add a variable"** → **"Add a single variable"**
3. Add the following variable:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (starts with `sk-proj-...`)
4. Click **"Create variable"**

### 5. Redeploy Site

After setting the environment variable:

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for the deployment to complete

### 6. Test Your Deployment

Once deployed, you'll receive a URL like `https://your-site-name.netlify.app`

1. Visit your site URL
2. Test with a sample URL (e.g., `https://nlabteam.com`)
3. Verify:
   - Website analysis works
   - Proposal generation works
   - DOCX export works
   - PDF export works

## Custom Domain (Optional)

To use a custom domain:

1. Go to **Site settings** → **Domain management**
2. Click **"Add domain alias"**
3. Follow the instructions to configure your DNS

## Automatic Deployments

Netlify automatically deploys your site when you push to GitHub:

- Push to `main` branch → Production deployment
- Push to other branches → Preview deployments

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key for GPT-4o-mini | Yes |

## Monitoring and Logs

### Function Logs

To view function logs:

1. Go to **Functions** tab
2. Click on a function name
3. View recent invocations and logs

### Site Analytics

Netlify provides basic analytics:

- Go to **Analytics** tab to view site traffic
- Upgrade to Netlify Analytics for more detailed insights

## Troubleshooting

### Deployment Failures

**Issue**: Build fails

- Check the build logs in Netlify dashboard
- Ensure `package.json` is correctly configured
- Verify all dependencies are listed

**Issue**: Functions timeout

- Netlify Functions have a 10-second timeout (free tier)
- Consider upgrading to Pro for 26-second timeout
- Optimize your functions to run faster

**Issue**: Out of memory

- Netlify Functions have 1024MB memory limit
- Puppeteer Core with @sparticuz/chromium is optimized for this
- Consider reducing HTML snippet size if needed

### Environment Variable Issues

**Issue**: OpenAI API errors

1. Verify `OPENAI_API_KEY` is set correctly in Netlify dashboard
2. Check that the API key is valid and has credits
3. Redeploy after setting/updating environment variables

**Issue**: Environment variables not working

- Environment variables require a redeploy to take effect
- Go to **Deploys** → **Trigger deploy** → **Deploy site**

### Function Errors

To debug function errors:

1. Check function logs in Netlify dashboard
2. Look for error messages and stack traces
3. Common issues:
   - Missing environment variables
   - Invalid API keys
   - Timeout errors (function took too long)
   - Memory errors (function used too much memory)

## Performance Optimization

### Function Cold Starts

Netlify Functions may have "cold starts" (slower first execution):

- This is normal for serverless architectures
- Functions "warm up" after first invocation
- Consider upgrading to Netlify Pro for faster cold starts

### Caching

To improve performance:

- Static assets are automatically cached by Netlify CDN
- Function responses are not cached by default
- Consider implementing caching logic in your functions if needed

## Cost Considerations

### Free Tier Limits

Netlify free tier includes:

- 100GB bandwidth per month
- 300 build minutes per month
- 125k function requests per month
- 100 hours of function runtime per month

### When to Upgrade

Consider upgrading to Netlify Pro if you need:

- More bandwidth or function requests
- Longer function timeout (26 seconds vs 10 seconds)
- Faster cold starts
- Priority support

## Security Best Practices

1. **API Keys**: Never commit API keys to Git. Always use environment variables.
2. **HTTPS**: Netlify provides free SSL certificates automatically.
3. **Access Control**: Consider implementing authentication if needed.
4. **Rate Limiting**: Consider adding rate limiting to prevent abuse.

## Rollback Deployment

If a deployment has issues:

1. Go to **Deploys** tab
2. Find a previous working deployment
3. Click **"Publish deploy"** to rollback

## CI/CD Integration

Netlify automatically integrates with your GitHub repository:

- Every push triggers a deployment
- Pull requests get preview deployments
- Failed builds prevent deployment

To customize CI/CD:

1. Edit `netlify.toml` to configure build settings
2. Add build plugins in Netlify dashboard
3. Configure deploy notifications

## Support Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Netlify Community Forum](https://answers.netlify.com/)
- [Netlify Status Page](https://www.netlifystatus.com/)

## Success Criteria

Your deployment is successful when:

- ✅ Site loads at your Netlify URL
- ✅ Website analysis completes successfully
- ✅ Proposal text is generated correctly
- ✅ DOCX export downloads successfully
- ✅ PDF export downloads successfully
- ✅ No errors in function logs
- ✅ Test with https://nlabteam.com completes successfully

## Next Steps

After successful deployment:

1. Test thoroughly with various websites
2. Monitor function logs for any errors
3. Set up custom domain if desired
4. Configure deploy notifications
5. Share your deployed URL!
