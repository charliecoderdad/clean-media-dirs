cd /home/charlie/projects/cleanuptorrentfs

LOGFILE="output.log"

date > $LOGFILE
bash /home/plexMedia/setPermissions.sh
echo "" >> $LOGFILE
echo "Cleaning up TV folders" >> $LOGFILE
echo "======================" >> $LOGFILE
node cleaner.js -p "/home/plexMedia/tv/" >> $LOGFILE
echo "" >> $LOGFILE
echo "Cleaning up movies" >> $LOGFILE
echo "==================" >> $LOGFILE
node cleaner.js -d true -p "/home/plexMedia/movies/" >> $LOGFILE
