// Collapse or uncollapse the clicked panel.
const togglePanel = (target) => {
    const panel = target.parentElement;
    panel.classList.toggle('collapsed');
}

// Process a date Object to a nicer format.
const processDate = (postDate) => {
    const date = new Date();
    let hours = postDate.getHours();
    let minutes = postDate.getMinutes();
    let am = true;
    let recentDate = false;
    if (postDate && date.toLocaleDateString("en-US") === post.postDate.toLocaleDateString("en-US")) {
        recentDate = true;
    }
    if (recentDate)  {
        if (hours > 11) {
            am = false;
            if (hours > 12) {
                hours = hours - 12;
            }
        }
        if (hours === 0) {
            hours = 12;
        }

        if (minutes < 10) {
            minutes = `0${minutes}`
        }

        if (recentDate) {
            return `Today at ${hours}:${minutes} ${am ? 'am' : 'pm'}`;
        } else {
            return postDate.toLocaleDateString("en-US");
        }
    }
}