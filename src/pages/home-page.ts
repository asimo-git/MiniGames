export function createHomePage(): HTMLElement {
  const homePage = document.createElement('main');

  homePage.innerHTML = `
    <section>
      <h1 class="home-page__title">A website will be here!</h1>
    </section>
  `;

  return homePage;
}
