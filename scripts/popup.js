// Time conversion constants
const TIME_METRICS = {
    coffee: { minutes: 5, emoji: '☕', label: 'Kaffeepausen' },
    video: { minutes: 10, emoji: '🎬', label: 'YouTube-Videos' },
    comment: { minutes: 2, emoji: '💬', label: 'LinkedIn-Kommentare' },
    walk: { minutes: 15, emoji: '🚶', label: 'Spaziergänge' },
    book: { minutes: 3, emoji: '📖', label: 'Buchseiten' }
};

function calculateTimeMetrics(minutes) {
    const metrics = {};
    for (const [key, value] of Object.entries(TIME_METRICS)) {
        metrics[key] = {
            value: minutes / value.minutes,
            formatted: (minutes / value.minutes).toFixed(1),
            emoji: value.emoji,
            label: value.label
        };
    }
    return metrics;
}

document.addEventListener("DOMContentLoaded", function () {
    // check the stored API key when popup opens
    chrome.storage.sync.get("groqApiKey", function (data) {
        const errorCard = document.querySelector(".error-card");

        if (data.groqApiKey) {
            errorCard.style.display = "none";
        }
    });

    chrome.storage.sync.get(["postCount", "timeSavedInMinutes"], function (data) {
        const postCount = data.postCount || 0;
        const timeSaved = Math.ceil(data.timeSavedInMinutes || 0);
        
        // Update basic stats
        document.getElementById("post-count").innerText = postCount;
        document.getElementById("time-saved").innerText = timeSaved + "m";

        // Calculate and display time metrics
        const metrics = calculateTimeMetrics(timeSaved);
        const timeMetricsContainer = document.getElementById("time-metrics");
        
        if (timeMetricsContainer) {
            timeMetricsContainer.innerHTML = `
                <div class="metric-item">
                    ${metrics.coffee.emoji} ${metrics.coffee.formatted} ${metrics.coffee.label}
                </div>
                <div class="metric-item">
                    ${metrics.video.emoji} ${metrics.video.formatted} ${metrics.video.label}
                </div>
                <div class="metric-item">
                    ${metrics.comment.emoji} ${metrics.comment.formatted} ${metrics.comment.label}
                </div>
                <div class="metric-item">
                    ${metrics.walk.emoji} ${metrics.walk.formatted} ${metrics.walk.label}
                </div>
                <div class="metric-item">
                    ${metrics.book.emoji} ${metrics.book.formatted} ${metrics.book.label}
                </div>
            `;
        }
    });

    // take user to the settings page
    const settingsButton = document.querySelector('.settings-icon');
    settingsButton.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
});