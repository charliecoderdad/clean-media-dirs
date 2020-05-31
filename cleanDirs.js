var fs = require('fs');
var path = require('path');
var execSync = require('child_process').execSync;
var rmdir = require('rimraf');
var argv = require('yargs');
var recursiveRead = require('fs-readdir-recursive');
var Transmission = require('transmission');

var extensionsToSearch = [".mkv", ".mp4", ".avi", ".mpg", ".mpeg", ".asf", ".wmv", ".m4v", ".sav"];
var foundFiles = [];
var trigger_file = ".clean_me";

var argv = require('yargs')
  .option('base_scan_dir', {
    alias: 'b',
    required: true,
    describe: 'Base directory to scan recursively for .clean_me files indicating that directory should be cleaned'
  })
  .option('testonly', {
    alias: 't',
    type: 'boolean',
    default: false,
    describe: 'Will only print filesystem operations to do; will not actually perform them'
  })
  .help('h')
  .argv;

var transmission = new Transmission({
	host: "192.168.0.69",
	port: 9091,
	username: "admin",
	password: "admin"
});

var myPromise = new Promise(function(resolve, reject) {
  transmission.active(function(err, result) {
    if (err) {
      console.log("ERROR: " + err);
      process.exit(1);
    } else {
      if (result.torrents.length > 0) {
        console.log("Active torrents found...");
        result.torrents.forEach(function(torrent) {
          console.log("Active torrent: " + torrent.name);
        });
        resolve(true);
      } else {
        resolve(false);
      }
    }
  });
});

myPromise.then(function(result) {
  if (result) {
    console.log("Exiting without cleaning due to active torrents.");
    process.exit(0);
  } else {
    console.log("No active torrents found.  Proceeding with clean up...");
  }
  var directories_to_clean = findDirectoriesToClean();

  directories_to_clean.forEach(function(dir) {
    cleanDir(dir);
  });
});

function findDirectoriesToClean() {
  var dirs = [];
  recursiveRead(argv.base_scan_dir, function(name, index, dir) {
    if (name === trigger_file) {
      dirs.push(dir);
    }
    return name !== '';
  });
  return dirs;
}

//Main function that gets called
function cleanDir(dir) {
  // basepath = path.resolve(basepath);
  verifyValidDirectory(dir);
  // Clean the specified directory of any files that are not in the extensionsToSearch extension type
  cleanBasePath(dir);
  // Move all good extension type files into the basepath
  moveGoodFilesToBase(dir)
  // Delete all directories within the basepath
  deleteAllDirsInBasedir(dir);
  // Delete all files that contain any from of 'sample' string
  deleteAllSampleFilesInBasedir(dir);
}

function deleteAllSampleFilesInBasedir(dir) {
  var files = fs.readdirSync(dir);
  files.forEach(function(file) {
    if (file.toUpperCase().indexOf('SAMPLE') !== -1) {
      file = path.resolve(dir, file);
      console.log("Deleting Sample File: " + file);
      if (!argv.testonly) {
        fs.unlinkSync(file);
      }
    }
  });
}

function deleteAllDirsInBasedir(dir) {
  var dirList = fs.readdirSync(dir);
  for (var i = 0; i < dirList.length; i++) {
    if (fs.statSync(path.join(dir, dirList[i])).isDirectory()) {
      var directory = path.join(dir, dirList[i]);;
      console.log("Directory to delete: " + directory);
      if (!argv.testonly) {
        rmdir(directory, function(error) {
          if (error) {
            console.log("Error found during deletion: " + error);
          }
        });
      }
    }
  }
}

function moveGoodFilesToBase(dir) {
  var files = getMovieFileLocationsArray(dir);
  for (var i = 0; i < files.length; i++) {
    fileBasePath = path.dirname(files[i]);
    fileName = path.basename(files[i]);
    // If the found file is not in the root path then we need to move it there
    if (fileBasePath !== dir) {
      console.log("Moving file " + files[i] + " to " + path.join(dir, fileName));
      if (!argv.testonly) {
        fs.renameSync(files[i], path.join(dir, fileName));
      }
    }
  }
}

function cleanBasePath(dir) {
  var fileList = fs.readdirSync(dir);
  for (var i = 0; i < fileList.length; i++) {
    var fileAbsPath = path.join(dir, fileList[i]);
    // if file is NOT one of the good extensions AND is a file we need to delete it
    if (extensionsToSearch.indexOf(path.extname(fileAbsPath).toLowerCase()) === -1 && fs.statSync(fileAbsPath).isFile() && path.basename(fileAbsPath) !== trigger_file) {
      console.log("File to delete in the basepath: " + fileAbsPath);
      if (!argv.testonly) {
        fs.unlinkSync(fileAbsPath);
      }
    }
  }
}

function getMovieFileLocationsArray(dir) {
  var returnArray = [];
  for (var i = 0; i < extensionsToSearch.length; i++) {
    var command = 'find ' + dir + ' -iname *' + extensionsToSearch[i];
    var myOutput = execSync(command).toString().trim();
    myOutput = myOutput.replace(/(?:\r\n|\r|\n)/g, ',');
    if (myOutput.length > 0) {
      var myArray = myOutput.split(",");
      for (var j = 0; j < myArray.length; j++) {
        var myFilePath = path.resolve(myArray[j]);
        returnArray.push(myFilePath);
      }
    }
  }
  return returnArray;
}

//Debug function to print the foundFiles array
function printArray(array) {
  for (var i = 0; i < array.length; i++) {
    console.log(i + ": " + array[i]);
  }
}

function verifyValidDirectory(dir) {
  try {
    fileStats = fs.statSync(dir);
    if (!fileStats.isDirectory()) {
      console.log("Not a valid directory: " + dir);
      process.exit(2);
    }
  } catch (error) {
    console.log("Error encountered when trying verify path existance: " + dir);
    console.log(error);
    process.exit(1);
  }
}
