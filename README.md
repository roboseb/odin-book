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


---To-Do---

-user authentication
-sign in with facebook
-change session secret
-fix collapsed panel gap
-prevent signing up with same username
-finalize by cleaning up code
-like button (only able to like others' posts + only one like?)
-standalone profile page
-fix friend accepting not refreshing
-unlike posts on click
-cancel friend request
-fix double friending?
-replace localhost references
-update site callback on facebook dev page
-sort post feed by date (combined user posts sorting)
-roll all button
-pokemon style idle animation
