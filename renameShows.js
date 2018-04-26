// Program for renaming media files to s##e## format.  Assumes that a unique season of episodes resides in the target argv.directory
var fs = require('fs');
var path = require('path');
var argv = require('yargs');

argv = argv.option('directory', {
  alias: 'd',
  description: "Directory containing files to be renamed",
  required: true
})
.option('filterEpisodeExpression', {
  alias: 'f',
  description: 'Common filter between file names to get the episode string. (i.e. "Ep-\\d\\d" or "e\\d\\d")',
  required: true
})
.option('season', {
  alias: 's',
  type: 'string',
  description: "If provided season is not shown in the filename.. so give a season to use for part of s##e## string (i.e. '04')",
  required: true
})
.option('testOnly', {
  alias: 't',
  type: 'boolean',
  description: "Boolean to set if actual rename occurs on the file system.  If disabled it will just log rename actions available",
  default: true
})
.option('showName', {
  describe: "Name of the show to use as beginning of file name (i.e. 'brooklyn.nine-nine')",
  required: true
})
.argv;

var fitlerExpression = "";
if (!argv.filterEpisodeExpression) {
  filterExpression = 'E\\d\\d';
} else {
  filterExpression = argv.filterEpisodeExpression;
  console.log("Filter expression received: " + filterExpression);
}

verifyValidDirectory(argv.directory);

var files = fs.readdirSync(argv.directory);

files.forEach(function(file) {

  var episodeFilterString = file.match(filterExpression);
  // console.log("EFS: " + episodeFilterString);
  if (episodeFilterString !== null) {
    var episodeNumStr = episodeFilterString.toString().match('\\d\\d');
    var seasonEpisodeString = "s" + argv.season.toString() + "e" + episodeNumStr;

    //Generate new file name
    var newFile = argv.showName + "." + seasonEpisodeString + path.extname(file);
    if (argv.testOnly) {
      console.log("Renaming " + file + " -> " + newFile);
    }
    newFile = path.resolve(argv.directory, newFile);
    // var newFile = file.replace(episodeString)
    if (!argv.testOnly) {
      var oldf = path.resolve(argv.directory, file);
      var newf = path.resolve(argv.directory, newFile);
      console.log(oldf + " -> " + newf);
      try {
        fs.renameSync(oldf, newf);
      } catch (error) {
        console.log("ERROR: " + error);
      }

    }

  }

});

function verifyValidDirectory(dir) {
  try {
    fileStats = fs.statSync(dir);
    if (!fileStats.isDirectory()) {
      console.log("Not a valid directory: " + dir);
      process.exit(1);
    }
  } catch (error) {
    console.log("Error encountered when trying verify path existance: " + dir);
    console.log(error);
    process.exit(1);
  }
}
