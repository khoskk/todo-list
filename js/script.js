function showPage() {
  document.body.style.visibility = '';
}

const styleLink = document.createElement('link');
styleLink.rel = 'stylesheet';
styleLink.href = 'css/style.css';

document.body.style.visibility = 'hidden';
styleLink.addEventListener('load', showPage);
styleLink.addEventListener('error', showPage);
document.head.append(styleLink);
