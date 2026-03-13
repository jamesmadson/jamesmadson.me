module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("icons");
  eleventyConfig.addPassthroughCopy("functions.js");
  eleventyConfig.addPassthroughCopy("functions-min.js");
  eleventyConfig.addPassthroughCopy("animation.gsap.js");
  eleventyConfig.addPassthroughCopy({"assets/": "assets/"});
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("case_studies/");
  eleventyConfig.addPassthroughCopy("about.html");
  eleventyConfig.addPassthroughCopy("work.html");
  eleventyConfig.addPassthroughCopy("feed.html");
  eleventyConfig.addPassthroughCopy("404.html");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");

  return {
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
