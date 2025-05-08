/**
 * Open YouTube video in lightbox
 * @requires https://github.com/sachinchoolur/lightGallery
*/

const videoPopup = (() => {

  let button = document.querySelectorAll('[data-gallery-video]');
  if (button.length) {
    for (let i = 0; i < button.length; i++) {
      lightGallery(button[i], {
        selector: 'this',
        plugins: [lgVideo],
        licenseKey: 'D4194FDD-48924833-A54AECA3-D6F8E646',
        download: false,
        youtubePlayerParams: {
          modestbranding: 1,
          showinfo: 0,
          rel: 0
        },
        vimeoPlayerParams: {
          byline: 0,
          portrait: 0
        }
      });
    }
  }

})();

export default videoPopup;
