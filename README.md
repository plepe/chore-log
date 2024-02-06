# chore-log
Logs the date of household chores, so that you can reconstruct when you've done something last.

# INSTALLATION
```sh
git clone https://github.com/plepe/chore-log
cd chore-log
npm install
cp data/template.json data/db.json
npm start
```

Visit http://localhost:3000

## Enable systemd service
Change path in chore-log.service

```sh
ln -s /path/to/directory/chore-log.service /etc/systemd/system/
systemctl enable chore-log
systemctl start chore-log
```
