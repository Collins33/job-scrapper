const axios = require("axios");
const cheerio = require("cheerio");
const fastArrayDiff = require("fast-array-diff");
const fs = require("fs");
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

    // check if the file exists and read it
    if (fs.existsSync("andela-jobs.json")) {
      const oldJson = fs.readFileSync("andela-jobs.json", "utf8");
      const oldJobs = JSON.parse(oldJson);
      // find difference btwn old jobs and new jobs
      const differencetInJobs = fastArrayDiff.diff(oldJobs, jobs, (a, b) => {
        return (
          a.name === b.name && a.link === b.link && a.location === b.location
        );
      });

      // check if anything was added
      if (differencetInJobs.added.length > 0) {
        console.log("=====ADDED JOBS======");
        differencetInJobs.added.forEach(item => {
          console.log(item);
        });
      }

      // Check if anything was removed
      if (differencetInJobs.removed.length > 0) {
        console.log("=====REMOVED JOBS======");
        differencetInJobs.removed.forEach(item => {
          console.log(item);
        });
      }
    } else {
      // if the file does not exist
      jobs.forEach(job => {
        console.log(job);
      });
    }
    fs.writeFileSync("andela-jobs.json", JSON.stringify(jobs, null, 2));
  })
  .catch(err => {
    console.error(err);
  });
