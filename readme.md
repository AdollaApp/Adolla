# Adolla

[![Discord](https://img.shields.io/discord/863837898503880724.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/NPr9n3XWGA)


Easy to use web app to read manga and comics.

## Features

- Easy progress tracking
- A light and dark theme (system based)
- Multiple icons to pick from
- Automatic backups every 12 hours
- Lists to store manga in
- A customizable reader
- Standalone iOS support
- Is a PWA
- Easy navigation from anywhere in the app
- Multiple intergrations to notify you about new chapters
  - Telegram
  - Discord webhooks
- Multiple scrapers to read from:
  - MangaSee
  - Mangadex
  - Manganelo
  - Mangahere
  - ReadComicOnline
  - ComicExtra
  - Guya.moe

## Setup

If you want to run Adolla you will need to have [Node.js](https://nodejs.org/en/) and [Git](https://git-scm.com/) installed. It's also possible not to use Git and to skip the next step by downloading the ZIP directly from GitHub. You can press the green "code" button on the top, then click "download ZIP", or click [this link](https://github.com/AdollaApp/Adolla/archive/refs/heads/master.zip).

To set this up, clone the repo. You can do this by running `git clone https://github.com/AdollaApp/Adolla` in a terminal in the parent folder.

Navigate to the project folder using `cd` or other means and install the relevant packages. This can be done with `npm install`.

Then, to start the app, run `npm start`. This will host the web server. You can now navigate to [`http://localhost:8080`](http://localhost:8080) on the machine to open the app in your browser. To use it on another device in the same network, find your local IP and go to `http://[your-ip]:8080`. To find your IP, see [this article](https://lifehacker.com/how-to-find-your-local-and-external-ip-address-5833108). 

## Environment variables

There are various environment variables you can use to customise Adolla.

--- 

`PORT`: the port the web app will run on 

`MAXREADINGTOSHOWPOPULAR`: the amount of items in "continue reading" required to stop showing "popular" on the home page (for faster loading)

`IGNOREREADING`: stop storing the progress. Old progress will be kept and shown, but nothing new will be added. Useful for shared servers.

`TELEGRAMTOKEN`: Telegram bot token to send from

`TELEGRAMUSER`: Telegram user ID to send new chapters & updates to. Not sure what your ID? Plug in your bot token, start the app, and send the bot a message. Adolla will log your user ID.

`DISCORDWEBHOOK`: Discord webhook URL to send new chapters & updates to.

`DISABLE_ANALYTICS`: disable sending a message to me when you start Adolla (useful for me to know how many users I have).

`IMAGE_PROXY_URL`: the URL to use for image proxy. By default is makes a request in the back-end and pipes the response through. It's recommended you use a third-party proxy on lower powered devices like a Raspberry Pi with 1GB of RAM.

## FAQ

### **How to run Adolla?**

See [setup](#setup).

### **Can I use Adolla on my iOS / Android phone?**

Most likely, yes. See the last paragraph of [setup](#setup).

### **How can I make Adolla send notifications**

Find the `.adolla` folder in your user directory. To find the user directory on Windows, see [this article](https://www.computerhope.com/issues/ch000109.htm). On Mac and Linux, this path is aliased to `~/`.

Open the `secret-config.json` file in that folder using your preffered text editor. 

To have Adolla notify you with new chapters on Discord, [make a Discord webhook](https://help.dashe.io/en/articles/2521940-how-to-create-a-discord-webhook-url) and place it in `"` quotation marks after `discord_webhook:`, replacing `null`.

To have Adolla notify you with new chapters on Telegram, [make a bot account on Telegram](https://sendpulse.com/knowledge-base/chatbot/create-telegram-chatbot). Take its token and place it in the `bot` field under `telegram`. Restart the server, then send the bot a message. It will log your Telegram ID. Copy this ID and place it in the `user` field under `telegram`. Then restart the server again.

### **When will Adolla send me notifications?**

When the developer makes an announcement or a new chapter comes out. Adolla considers something a new chapter when the chapter after one you've read (more than 90% of) is newer than the date you read the previous one on.

### **How to uninstall Adolla?**

To uninstall Adolla, stop the process (likely using CRTL + C) and delete the project folder. Also find `.adolla` in your user directory and delete it there.

You might still see Adolla on `http://localhost:8080`. This is merely a cached version, and not the real app. Clearing the cache for this page will remove the cache.
### **How is Adolla?**

Good, thanks for asking!

## Screenshots

![Image of the home page](https://raw.githubusercontent.com/JipFr/jipfr/master/screenshots/adolla/0.png)
![Lists page](https://raw.githubusercontent.com/JipFr/jipfr/master/screenshots/adolla/1.png)
![Backups page](https://raw.githubusercontent.com/JipFr/jipfr/master/screenshots/adolla/2.png)
![Manga page](https://raw.githubusercontent.com/JipFr/jipfr/master/screenshots/adolla/3.png)
![Reader page](https://raw.githubusercontent.com/JipFr/jipfr/master/screenshots/adolla/4.png)
![Reader with overlay](https://raw.githubusercontent.com/JipFr/jipfr/master/screenshots/adolla/5.png)
![Mobile](https://raw.githubusercontent.com/JipFr/jipfr/master/screenshots/adolla/mobile_0_light.png)
![Mobile, dark](https://raw.githubusercontent.com/JipFr/jipfr/master/screenshots/adolla/mobile_0_dark.png)
![Mobile](https://raw.githubusercontent.com/JipFr/jipfr/master/screenshots/adolla/mobile_1_light.png)
![Mobile, dark](https://raw.githubusercontent.com/JipFr/jipfr/master/screenshots/adolla/mobile_1_dark.png)
![Mobile](https://raw.githubusercontent.com/JipFr/jipfr/master/screenshots/adolla/mobile_2_light.png)
![Mobile, dark](https://raw.githubusercontent.com/JipFr/jipfr/master/screenshots/adolla/mobile_2_dark.png)
![Mobile](https://raw.githubusercontent.com/JipFr/jipfr/master/screenshots/adolla/mobile_3_light.png)
![Mobile, dark](https://raw.githubusercontent.com/JipFr/jipfr/master/screenshots/adolla/mobile_3_dark.png)
![Alternative app icons on iOS](https://raw.githubusercontent.com/JipFr/jipfr/master/screenshots/adolla/icons.jpg)
