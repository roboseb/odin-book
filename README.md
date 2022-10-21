# Odin-Book

---Devlog---

October 5th, 2022

    Did a lot of brainstorming for this one, and I think I came up with a reasonably doable project that is at least a little interesting. 

    Basically, a social game type deal, where the game is similar to the dice game in Kingdom Come, Deliverance. In that game, you can find lots of different types of cheat dice that are weighted in all sorts of interesting ways. Depending on how much time I want to put into it, I will either just remake that idea, or add to it a simple card mechanic that changes your goal in dice rolls.

    Also, feels good coming back to a single project setup. Although my mind is slightly scrambled having only barely learned some of this stuff, and then coming back to Pug and friends after dealing with React for the past week.

October 6th, 2022

    We'll see how much of the basic stuff I can get done in one day. I'd like to actually start with a basic layout this time. For my Blog API project I just added all the functionality first and styled after, with no plan as to where I was going with things. I think this led to most of layout issues.

    Hey, I got multiple stylesheets working for the first time in my life, thanks to pug!

October 7th, 2022

    Please God, I just want to use a JS function in Pug outside of an onclick attribute. 

    Last prayer didn't work. Please God, I just want express to parse data and not send me undefined.

October 10th, 2022

    Took a couple days off. Not my fault, Overwatch 2 came out and that was out of my control. Today I want to get the friending stuff working, as well as likes on comments and posts. And if I get those two done, next thing is Facebook login integration.

October 11th, 2022

    Should be able to finish all the non-dice related functionality today. I think it's mostly only the facebook login that's left, but I may try to do live chat as well, since this app would be so much cooler if I could practive with that and then use the knowledge to make a live dice game. Time will tell, as always.

October 12th, 2022

    Time to get really cracking on the socket.io stuff. I was having issues yesterday, the classic "Youtube video does a simple thing, but that's not happening on my screen." Today should be a better start, slept well and am jamming out to Yin Yin.

    Spent like an hour trying to get dice with rounded corners to look nice, did not work out very well.

October 13th, 2022

    My package of sausage says that it's best before October 11th. We'll see about that.

    I think I'm comfortable spending at least another seven days on this project, which at the rate I'm going will hopefully be enough time to get some pretty good functionality down. Time will tell. I think I may be able to get an online playable version of the basic dice game working today.

    So I think my PC restarted due to a windows update without me closing out of the Ubuntu virtualbox I have. May have fucked the repo a bit, but I think it's all mostly here and working.

Ocotober 14th, 2022

    I think the sausage I cooked was indeed a little out of date. Was tasty though, so I'll just have to try it again to check.

    Today should be more than enough to at least get the local logic done for the base dice game. Would be nice if I could also get it working through socket.io somehow. Then I may even be able to justify creating custom dice or win conditions, whichever sounds more fun.

October 17th, 2022

    Slept like ass last night. Starting to work on this quite a bit later than I usually do, and after having lost a bunch of Hearthstone. Oh welly. I think I'm in a pretty good place to get the web socket stuff working today.

October 18th, 2022

    Thinking that I can give this a bout one more week. As in, maybe five more working days. The game is very close to being fully functional online through web sockets. I think five days also gives me enough time to have custom dice generated that are cosmetic only. Any mechanic changes would probably add a decent amount of time to development, even if it's only a day or two. Wanna be done with everything by halloween weekend so that I can get plastered.

October 19th, 2022

    Gonna try to give myself about four days on this one. Should be a decent amount of time to fully style the site, polish up some of the social stuff, and add all the custom dice shit to Kismet. I think custom dice is the only mechanic I can really add at this point, but it's already kinda implemented. Shouldn't be too hard.

Ocotober 20th, 2022

    Slept like dogshit two nights ago, but slept like tem hours last night. Hoping I can capitalize on that and do the rest of the complicated stuff today, so that I can polish up styling and minor details for the last couple days.

    To-Do list is getting pretty big. Wonder how much of that I've done already, and how much of it will be left undone.

October 21st, 2022

    Two days left, if all goes well on this project. Two big things I want to get done before I start with proper styling today. First, having custom dice show up in multiplayer games, since I already have them working in local games. Second, having profiles reload when sending some sort of request to properly update friends and dice, since that shit apparently only works when signing out and back in. (Note to me: seems that the user object just doesn't get updated until signed out/in?)

    So I'm having some sort of massive issue where certain errors are just being swalled, and not being logged anywhere. So what I have to do is notice there's an error, and then play a little archaeology/scavenger hunt to find the issue. Is this the most effective way? No. Do I have time to figure out what the issue with the issue finder is? Not at this very moment. Regardless, I now have big item the first working, which is having custom dice show up in multiplayer.

    Sure seems that I'm running into issues with testing multiplayer games with two users signed in from one machine. Basically whoever signs in last is sign in on both machines. This'll be a bitch to test.


---To-Do---

DONE-user authentication
DONE-sign in with facebook
-change session secret
DONE-fix collapsed panel gap
-prevent signing up with same username
-finalize by cleaning up code
DONE-like button (only able to like others' posts + only one like?)
DONE-standalone profile page
-fix friend accepting not refreshing
DONE-unlike posts on click
-cancel friend request
-fix double friending?
-replace localhost references
-update site callback on facebook dev page
DONE-sort post feed by date (combined user posts sorting)
DONE-roll all button
-pokemon style idle animation
DONE-fix straights
-choose score to play to
-Disable dice options until new game started.
-rerandomize room key
-fancy winning/losing animations
-send bust/last turn/win modal through web socket
-fix bust dice rolling both players animation bug
-fix singleplayer dice bugs
-fix facebook permissions issue
-readd helmet and fix helmet errors
-tweak pipped die odds
-wager likes in multiplayer?
-fix friends 500 error and pages not updating friend info immediately after change
-delete all old posts
-add custom dice to multiplayer
-add ability to unset custom dice
-how to play section
-about section
-remove sign-in values
-fix hostUser/guestUser declarations to work with multiple sets of games running.