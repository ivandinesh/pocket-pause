// Test-only view of trusted packaged scripts. Production HTML stays externalized.
const fs=require('fs'),path=require('path');
exports.html=()=>{const root=path.join(__dirname,'../dist');return fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script\b([^>]*?)\s+src="(\/[^"?]+)"([^>]*)><\/script>/g,(all,before,url,after)=>'<script'+before+after+'>'+fs.readFileSync(path.join(root,url.slice(1)),'utf8')+'</script>');};
