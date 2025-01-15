

# Development-of-a-model-for-detecting-mammals-using-photos-from-UAVs
To determine population size and more accurately predict population decline  Manually is a very labor-intensive process, one photo takes a lot of time, often this data is not processed at all.  Development of a mammal detection model for cases when there are several individuals in the photo can make the task easier. 
<hr>
<h3>Launch</h3>
The last current version is "django+api_V2"<br>

First,  install all requirements from <i>requirements.txt</i><br>

```python
pip isntall -r requirements.txt
```

Then from the root folder start the servers

```bash
python run_server.py
```

And go to http://127.0.0.1:8001 or other url depending on your settings
<hr>
<h3>Settings</h3>
You can change settings in the <i>config.py</i>:
<li>Local host</li>
<li>Ports</li>
<li>Django paths/urls</li>
<li>FastApi paths/urls</li>
<li>Paths to startup file</li>
<li>Django media dirs</li>
<li>Model supported classes</li>
<li>Paths to model</li>
<hr>
<h3>Input file</h3>
<p>You can use the appropriate files either individually or in an archive.</p>
<p>
Supported file extensions for detection:
<li>Image extensions: png, jpg, jpeg, bmp, webp, tiff, tif.</li>
<li>Video extensions: mp4, asf, avi, m4v, mkv, mov, mpeg, mpg, ts, wmv, webm.</li>
<li>Archive extensions: zip.</li>
</p>
<p>
Supported file extensions for annotation editing:
<li>Image extensions: png, jpg, jpeg, bmp, webp, tiff, tif.</li>
<li>Archive extensions: zip.</li>
</p>
<hr>
<h3>Output file</h3>
Output of detection is  archive:
<li>txt file describing mammals amount on each image/video </li>
<li>json file with annotations in COCO format(only for images)</li>
<li>your annotated files</li>
Output of detection editing is archive:
<li>json file with annotations in COCO format</li>
<li>your annotated files</li>
<hr>
Link to Google Drive: https://drive.google.com/drive/folders/1SZ--uB5IblpWTe6l_Tmqg0XXZIprMRzH?usp=sharing
