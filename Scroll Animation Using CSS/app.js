/*
 Copyright (c) 2026 Ashraf Morningstar
 These are personal recreations of existing projects, developed by Ashraf Morningstar
 for learning and skill development.
 Original project concepts remain the intellectual property of their respective creators.
 Repository: https://github.com/AshrafMorningstar
*/

/*
These are personal recreations of existing projects, developed by Ashraf Morningstar for learning and skill development. Original project concepts remain the intellectual property of their respective creators.
GitHub Profile: https://github.com/AshrafMorningstar
*/

const boxes = document.querySelectorAll('.box')
window.addEventListener('scroll', checkBoxes)
checkBoxes()
function checkBoxes() {
const triggerBottom = window.innerHeight /5 * 4
boxes.forEach(box => {
const boxTop = box.getBoundingClientRect().top
if(boxTop < triggerBottom) {
box.classList.add('show')
} else {
box.classList.remove('show')
}
})
}