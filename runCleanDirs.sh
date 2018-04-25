cd /home/charlie/github/clean-torrent-dirs

LOGFILE="output.log"

date | --append tee $LOGFILE
#bash /ssd/plexMedia/setPermissions.sh
echo "" | tee --append $LOGFILE
echo "Cleaning up target folders in /ssd/plexMedia" | tee --append $LOGFILE
echo "============================================" | tee --append $LOGFILE
node cleanDirs.js --base_scan_dir "/ssd/plexMedia" | tee --append $LOGFILE
echo "*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*" | tee --append $LOGFILE
