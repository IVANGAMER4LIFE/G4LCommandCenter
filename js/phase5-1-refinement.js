(() => {
  document.querySelectorAll('.hotspot').forEach((panel) => {
    if (!panel.querySelector('.p51-edge')) {
      const edge = document.createElement('span');
      edge.className = 'p51-edge';
      panel.appendChild(edge);
    }
    if (!panel.querySelector('.p51-scan')) {
      const scan = document.createElement('span');
      scan.className = 'p51-scan';
      panel.appendChild(scan);
    }
    if (!panel.querySelector('.p51-led')) {
      const led = document.createElement('span');
      led.className = 'p51-led';
      panel.appendChild(led);
    }
  });
})();
