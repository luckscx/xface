  
var method = {
    base:1,
    left_eyebrow:2,
    right_eyebrow:2,
    left_eye:2,
    right_eye:2,
    mouth:1,
    nose:1
};
    for(organ in method){
        if(organ === 'base'){
            continue;
        }
        console.log(organ);    
    }
