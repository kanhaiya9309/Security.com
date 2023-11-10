const setUpScrolling = () =>{
    const container = [...document.querySelectorAll('.movie-container')];
    const preButton = [...document.querySelectorAll('.pre-btn')];
    const nextButton =[...document.querySelectorAll('.next-btn')];

    container.forEach((item,i)=>{

        const containerDimension = item.getBoundingClientRect();
        const containerWidth = containerDimension.width;

     nextButton[i].addEventListener("click",()=>{
        item.scrollLeft += containerWidth;
     })
     preButton[i].addEventListener("click",()=>{
        item.scrollLeft -= containerWidth;
     })

    })

}