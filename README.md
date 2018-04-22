# Clean Torrent dirs

To have a directory be cleaned create a .clean_me file in the target directory.

"Cleaning" means that we will move any files that match the extension list below to the root of that directory and then remove any remaining files and directories within that base directory.
`[".mkv", ".mp4", ".avi", ".mpg", ".mpeg", ".asf", ".wmv", ".m4v", ".sav"]`
