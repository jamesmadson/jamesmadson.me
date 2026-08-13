module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("icons");
  eleventyConfig.addPassthroughCopy("functions.js");
  eleventyConfig.addPassthroughCopy("functions-min.js");
  eleventyConfig.addPassthroughCopy("animation.gsap.js");
  eleventyConfig.addPassthroughCopy({"assets/": "assets/"});
  eleventyConfig.addPassthroughCopy("feed.html");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("llms.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");

  return {
    htmlTemplateEngine: "njk",
    dir: {
      input: ".",
      includes: "_includes",
      layouts: "_includes/layouts",
      data: "_data",
      output: "_site"
    },
    passthroughFileCopy: true
  };
};
