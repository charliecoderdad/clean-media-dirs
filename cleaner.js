var fs = require('fs');
var pathmod = require('path');
var execSync = require('child_process').execSync;
var rmdir = require('rimraf');
var argv = require('yargs');

var extensionsToSearch = [".mkv", ".mp4", ".avi", ".sav", ".mpg", ".mpeg", ".asf", ".wmv", ".m4v" ];
var foundFiles = [];

var argv = require('yargs')
   .option('path', { alias: 'p', require: true, describe: 'Path to directory to clean (i.e. /home/plexMedia/tv)'})
   .option('testonly', { alias: 't', type: 'boolean', default: false, describe: 'Will only print filesystem operations to do; will not actually perform them'})
   .option('safety_check', { alias: 's', type: 'boolean', default: true, describe: 'If on then we will ensure that the string \'plexMedia\' is in the specified path'})
   .option('direct_clean', { alias: 'd', type: 'boolean', default: false, describe: 'Will clean a subfolder directly (good for /home/plexMedia/movies)'})
   .help('h')
   .argv;

// var mainPath = "c:/cygwin64/home/charlie/tmpPlayground";
var mainPath = argv.path;
mainPath = pathmod.resolve(mainPath);
verifyValidDirectory(mainPath);

if (mainPath.indexOf("plexMedia") === -1) {
   console.log("WARNING!!!!  Detected the path is not a plexMedia path");
   if (argv.safety_check) {
      console.log("Exiting process before performing any filesystem functions.  You can run this process with safety_check flag set to false to override this safety check");
      process.exit(3);
   }
   console.log("");
}

if (argv.direct_clean) {
   cleanDir(mainPath);
} else {
   var showsFolders = fs.readdirSync(mainPath);
   for (var i = 0; i < showsFolders.length; i++) {
      var directory = pathmod.join(mainPath, showsFolders[i]);
      if (fs.statSync(directory).isDirectory()) {
         console.log("cleaning directory " + directory);
         cleanDir(directory);
      }
   }
}

//==FUNCTIONS BELOW

//Main function that gets called
function cleanDir(basepath) {
   // basepath = pathmod.resolve(basepath);
   verifyValidDirectory(basepath);   
   // Clean the basepath of any files that are not in the extensionsToSearch extension type
   cleanBasePath(basepath);      
   // Move all good extension type files into the basepath
   moveGoodFilesToBase(basepath)   
   // Delete all directories within the basepath
   deleteAllDirsInBasedir(basepath);
   console.log("");
}

function deleteAllDirsInBasedir(path) {
   var dirList = fs.readdirSync(path);
   for (var i = 0; i < dirList.length; i++) {
      if (fs.statSync(pathmod.join(path, dirList[i])).isDirectory()) {
         var directory = pathmod.join(path, dirList[i]);;
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

function moveGoodFilesToBase(path) {
   var files = getMovieFileLocationsArray(path);
   for (var i = 0; i < files.length; i++) {
      fileBasePath = pathmod.dirname(files[i]);
      fileName = pathmod.basename(files[i]);      
      // If the found file is not in the root path then we need to move it there
      if (fileBasePath !== path) {
         console.log("Moving file " + files[i] + " to " + pathmod.join(path, fileName));
         if (!argv.testonly) {
            fs.renameSync(files[i], pathmod.join(path, fileName));
         }
      }
   }
}

function cleanBasePath(path) {
   var fileList = fs.readdirSync(path);
   for (var i = 0; i < fileList.length; i++) {
      var fileAbsPath = pathmod.join(path, fileList[i]);
      // if file is NOT one of the good extensions AND is a file we need to delete it
      if (extensionsToSearch.indexOf(pathmod.extname(fileAbsPath).toLowerCase()) === -1 && fs.statSync(fileAbsPath).isFile()) {         
         console.log("File to delete in the basepath: " + fileAbsPath);
         if (!argv.testonly) {
            fs.unlinkSync(fileAbsPath);   
         }            
      }      
   }
}

function getMovieFileLocationsArray(path) {
   var returnArray = [];
   for (var i = 0; i < extensionsToSearch.length; i++) {
      var command = 'find ' + path + ' -iname *' + extensionsToSearch[i];
      var myOutput = execSync(command).toString().trim();
      myOutput = myOutput.replace(/(?:\r\n|\r|\n)/g, ',');      
      if (myOutput.length > 0) {
         var myArray = myOutput.split(",");
         for (var j=0; j < myArray.length; j++) {
            var myFilePath = pathmod.resolve(myArray[j]);
            returnArray.push(myFilePath);
         }   
      }
   }
   return returnArray;
}

//Debug function to print the foundFiles array
function printArray(array) {  
   for (var i = 0; i<array.length; i++) {
      console.log(i + ": " + array[i]);
   }
}

function verifyValidDirectory(path) {
   try {
      fileStats = fs.statSync(path);
      if (!fileStats.isDirectory()) {
         console.log("Not a valid directory: " + path);
         process.exit(2);
      }            
   } catch (error) {
      console.log("Error encountered when trying verify path existance: " + path);
      console.log(error);
      process.exit(1);
   }
}
