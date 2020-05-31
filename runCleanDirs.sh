cd /home/charlie/git/clean-torrent-dirs
LOGFILE="cleandirs.log"

date | tee --append $LOGFILE
echo "" | tee --append $LOGFILE
echo "Cleaning up target folders in /media/plexMedia" | tee --append $LOGFILE
echo "--------------------------------------------" | tee --append $LOGFILE
node cleanDirs.js --base_scan_dir "/media/plexMedia" | tee --append $LOGFILE
echo "********************************************************************************" | tee --append $LOGFILE
echo "********************************************************************************" | tee --append $LOGFILE
echo "********************************************************************************" | tee --append $LOGFILE
