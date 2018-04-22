cd /home/charlie/github/clean-torrent-dirs

LOGFILE="output.log"

date | tee $LOGFILE
bash /ssd/plexMedia/setPermissions.sh
echo "" | tee $LOGFILE
echo "Cleaning up target folders in /ssd/plexMedia" | tee $LOGFILE
echo "============================================" | tee $LOGFILE
node cleanDirs.js --base_scan_dir "/ssd/plexMedia" | tee $LOGFILE
