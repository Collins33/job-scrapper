const axios = require("axios");
const cheerio = require("cheerio");
const arrayDiff = require("fast-array-diff");

// retrieve our html
axios
  .get("https://boards.greenhouse.io/andela")
  .then(response => {
    // load the html using cherio
    const $ = cheerio.load(response.data);

    const jobs = $("div.opening")
      .map(function() {
        // data-mapped & href are attributes of the a
        // tag with the names

        // find a tag with data-mapped and href attribute
        // the name is a text
        const name = $(this)
          .find("a[data-mapped][href]")
          .text();

        // the link has an attribute of href
        const link = $(this)
          .find("a[data-mapped][href]")
          .attr("href");
        const location = $(this)
          .find("span.location")
          .text();
        return { name, link, location };
      })
      .toArray();
    console.log(jobs);
  })
  .catch(err => {
    console.error(err);
  });
