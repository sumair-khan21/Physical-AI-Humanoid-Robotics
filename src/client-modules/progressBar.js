
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
    // Create progress bar element
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress-bar';
    document.body.appendChild(progressBar);

    const updateProgress = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = scrollTop > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = `${scrollPercent}%`;
    };

    // Update on scroll
    window.addEventListener('scroll', updateProgress);

    // Update on route change (in case page height changes)
    // Docusaurus uses history api, but a simple scroll listener covers movement.
    // We might need to reset width on navigation if scroll position resets? 
    // Docusaurus handles scroll restoration, so the listener should catch it.
}
