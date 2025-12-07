
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
    // Create button element
    const toTopBtn = document.createElement('button');
    toTopBtn.className = 'scroll-to-top-btn';
    toTopBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 15l-6-6-6 6"/>
    </svg>
  `;
    toTopBtn.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(toTopBtn);

    // Logic to toggle visibility
    const toggleVisibility = () => {
        if (window.scrollY > 300) {
            toTopBtn.classList.add('visible');
        } else {
            toTopBtn.classList.remove('visible');
        }
    };

    // Logic to scroll to top
    toTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    });

    // Listeners
    window.addEventListener('scroll', toggleVisibility);
}
