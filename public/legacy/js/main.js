
//*  users have their own profile page and can see their total points earned, total levels completed, total correct answers, 
   total problems attempted, pup streak record, and their collection of benny colors unlocked. Percentage of correct answers.
   benny has his own card on the profile page that shows his current color scheme, current tier, 
   and unlockable tiers with their point and pup streak requirements. Its set up to whare the unlockable tiers are scrollable
   from left to right. the powers that are locked have a ticket price on them showing how many points are needed to unlock them. 
   user uses points aquired to unlock benny tiers and colors. colors are 250 points each. *// 
   
// Restore contrast toggle behavior for static pages that rely on DOM script
(function () {
  const toggle = document.getElementById('contrast-toggle');
  if (!toggle) return;

  const apply = (on) => {
    document.body.classList.toggle('high-contrast', !!on);
    toggle.setAttribute('aria-pressed', String(!!on));
  };

  // apply saved preference
  const saved = localStorage.getItem('highContrast');
  apply(saved === 'true');

  toggle.addEventListener('click', () => {
    const isOn = document.body.classList.toggle('high-contrast');
    toggle.setAttribute('aria-pressed', String(!!isOn));
    localStorage.setItem('highContrast', isOn ? 'true' : 'false');
  });
})();