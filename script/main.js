const navbar = document.querySelector('.navbar')
const buttonHeader = document.getElementById('btn-header')
const secondSection = document.getElementById('sobre')
const headerHighlightText = document.getElementById('header-highlight-text')
const buttonNavbarToggler = document.querySelector('.navbar-toggler')

// debounce function for not invoke the event everytime when user scrolls
function debounce(func, wait) {
	let timer = null;
	return function() {
		clearTimeout(timer);
		timer = setTimeout(func, wait);
	}
}


let navbarIsOpen = false
let navbarStyle = ''

// Function to add style when header is on the first section
function addHeaderStyleWhenFirstSection() {
  navbarStyle = 'navbar navbar-expand-md fixed-top navbar-dark'
  if (navbarIsOpen) { navbarStyle += ' navbar-open-dark' }
  
  navbar.classList = navbarStyle

  buttonHeader.classList = 'btn btn-outline-light rounded-3'
  headerHighlightText.classList = ''
}

// Function to add style when header is not on the first section
function addHeaderStyleWhenOtherSection() {
  navbarStyle = 'navbar navbar-expand-md fixed-top navbar-light shadow bg-light'

  navbar.classList = navbarStyle
  buttonHeader.classList = 'btn rounded-3 btn-outline-primary'
  headerHighlightText.classList = 'text-primary'
}

window.addEventListener('scroll', debounce(() => {
  if (window.scrollY > (secondSection.offsetTop - 63 )) {
    addHeaderStyleWhenOtherSection()
  } else {
    addHeaderStyleWhenFirstSection()
  }
}, 200))


buttonNavbarToggler.addEventListener('click', () => {
  navbarIsOpen = !navbarIsOpen

  if (window.scrollY < (secondSection.offsetTop - 63 )) {
    if (navbarIsOpen) {
      navbar.classList.add('navbar-open-dark')
    } else {
      navbar.classList.remove('navbar-open-dark')
    }
  }
})


// function to change active 'LI' element
// função de mudar o LI ativo
const navbarItems = document.querySelectorAll('.nav-item a')

for (let navbarItem of navbarItems) {
  let navbarItemHref
  navbarItem.addEventListener('click', () => {
    navbarItemHref = navbarItem.getAttribute('href')

    if (navbarItemHref == "#home") {
      addHeaderStyleWhenFirstSection()
    } else {
      addHeaderStyleWhenOtherSection()
    }
    
    for (let navbarItemTwo of navbarItems) {
      navbarItemTwo.classList.remove('active')
    }
    navbarItem.classList.add('active')
  })
}