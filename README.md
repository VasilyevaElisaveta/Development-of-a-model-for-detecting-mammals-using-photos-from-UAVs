# Development-of-a-model-for-detecting-mammals-using-photos-from-UAVs
To determine population size and more accurately predict population decline  Manually is a very labor-intensive process, one photo takes a lot of time, often this data is not processed at all.  Development of a mammal detection model for cases when there are several individuals in the photo can make the task easier. 
<hr>
<b>The last current version is "django+api"</b><br>
Files are supported only with the following extensions:
<ul>
<li>Image extensions: png, jpg, jpeg, bmp, webp, tiff, tif.</li>
<li>Video extensions: mp4, asf, avi, m4v, mkv, mov, mpeg, mpg, ts, wmv, webm.</li>
<li>Archive extensions: zip.</li>
</ul>
<b>First,  install all requirements from <i>requirements.txt</i></b><br>


```python
pip isntall -r requirements.txt
```

<b>Then from the root folder start the server for API</b>

```bash
uvicorn api.main:app
```

<b>After that walk to the DetMals folder and start server for Django</b>
The main thing is to run the server not on port 8000, since the API runs on it.

```bash
python manage.py runserver 8001
```

<b>And finally go to http://127.0.0.1:8000 or other url depending on your port</b>
<hr>
Link to Google Drive: https://drive.google.com/drive/folders/1SZ--uB5IblpWTe6l_Tmqg0XXZIprMRzH?usp=sharing
