const axios=require('axios');
const express=require('express');
const app=express();
const dotenv=require('dotenv');
dotenv.config();
const cors=require('cors');
const port=process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// medium
async function getClaps(url){
    const data=await axios.get(url);
    const paragraph = data.data.toString();
    const regex='\"clapCount\":';
    var found = paragraph.search(regex);
    var result="";
    found+=12;
    while(paragraph[found]!=','){
        result+=paragraph[found];
        found++;
    }
    return {
        platform:"medium",
        reactions:result
    };
}

async function getLikes(url){
    // https://dev.to/api/articles?username=nataliedeweerd
    let user=15;
    var username="";
    while(url[user]!== '/'){
        username+=url[user];
        user++;
    }
    user++;
    let slug="";
    for(let i=user;i<url.length;i++){
        slug+=url[i];
    }
    const data=await axios.get(`https://dev.to/api/articles?username=${username}`);
    
    var blogData=data.data
    var blog=blogData.find(element=>element.slug===slug);
    var exceldata={
        platform:"dev.to",
        public_reactions_count: blog.public_reactions_count,
        // positive_reactions_count: blog.positive_reactions_count,
        // comments_count: blog.comments_count,
        // reading_time_minutes: blog.reading_time_minutes,
    }
    return exceldata;
}


app.get('/',(req,res)=>{
    res.send("Api for tracking reactions to Medium and dev.to");
});

app.get('/reactions?:url',async(req,res)=>{
    try{
        var data;
        if(req.query.url.search('medium.com')>0){
            data=await getClaps(req.query.url);    
        }else if(req.query.url.search('dev.to')>0){
            data= await getLikes(req.query.url);
        }
        res.send(data);
    }catch(e){
        res.status(404).send("Error");
    }
})

// app.get('/dev/likes?:url',async(req,res)=>{
//    let likeCount= await getLikes(req.query.url);
//    console.log(likeCount);
//     res.send("ok");
// })

app.listen(port,()=>{
    console.log(`Server is listening at ${port}`);
});
