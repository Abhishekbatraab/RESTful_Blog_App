var  express             =   require('express'),
      app                 =   express(),
      bodyparser          =   require('body-parser'),
      methodOverriding    = require('method-override'),
      expressSanitizer   = require('express-sanitizer'),
      mongoose            =   require('mongoose');
                        

//App Config
mongoose.connect("mongodb://localhost/restful_blog_app", {useNewUrlParser: true })
app.set("view engine", 'ejs');
app.use(express.static("views"));
app.use(bodyparser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverriding("_method"));
mongoose.set('useFindAndModify', false);

//making the schema using mongoose 
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
})   
//Making a model
var Blog = mongoose.model("Blog", blogSchema);

//RESTful Routes 
app.get("/", (req,res)=>{
    res.redirect("/blogs");
});
//IndexRoute
app.get("/blogs", (req,res)=>{
    Blog.find({}, (error, blogs)=>{
        if(error){
            console.log("Error while searching records");
        }else{
            res.render('index', {'blogs': blogs});
        }
    })    
});
//Create Route
app.get('/blogs/new', (req, res)=>{
    res.render('new');
});
//show blogs route
app.post('/blogs', (req,res)=>{
    console.log("Before sanitizing: ", req.body);
    req.body.blog.body = req.sanitize(req.body.blog.body);
    console.log("After sanitizing: ", req.body);
    Blog.create(req.body.blog, (err, newBlog)=>{
        if(err){
            console.log("There is an error while creating a record ", error);
            res.render('new');
        }else{
            console.log("Blog Created");
            //then, redirect to the index
            res.redirect("/blogs");
        }
    })
    }
);
//show a particular blog
app.get('/blogs/:id', (req, res)=>{
    Blog.findById(req.params.id, (err, foundBlog)=>{
        if(err){
            res.render('/blogs');
        }else{
            console.log("Blog found");
            res.render('show', {blog: foundBlog});
        }
    });
});
app.get('/blogs/:id/edit', (req,res)=>{
    Blog.findById(req.params.id, (err, foundBlog)=>{
        if(err){
            res.render('/blogs');
        }else{
            console.log(`Edit ${req.params.id} blog`);
            res.render('edit', {blog: foundBlog});
        }
    });
});
//UPDATE ROUTE
app.put("/blogs/:id", (req, res)=>{
    Blog.findOneAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
       if(err){
           res.redirect('/blogs');
       }else{
           res.redirect(`/blogs/${req.params.id}`);
       }
    });
});
//DELETE ROUTE
app.delete("/blogs/:id", (req, res)=>{
    //Destroy the blog
    Blog.findByIdAndRemove(req.params.id, (err)=>{
        if(err){
            res.redirect('/blogs');
        }else{
            res.redirect('/blogs');
        }
    });
})

//Server is listening here
app.listen(process.env.PORT||3000, ()=>{
    console.log("Blog App Server Started");
});
