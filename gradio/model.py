from ultralytics import YOLO
from numpy import ndarray
from cv2 import VideoCapture, CAP_PROP_FRAME_WIDTH, CAP_PROP_FRAME_HEIGHT, CAP_PROP_FPS, VideoWriter_fourcc, VideoWriter
from collections import Counter
from file_management import FileManager


class Model:

    def __init__(self) -> None:
        self.__model = YOLO('models/best.pt')

    def predict_image(self, image_path: str, save_folder: str, data_file: str):

        results = self.__model(image_path, verbose=False)

        image: ndarray = results[0].plot()
        FileManager.save_image(image, image_path, save_folder)

        detected_classes: dict = Counter(results[0].boxes.cls.tolist())
        class_names: dict = self.__model.names
        FileManager.save_detection_data(data_file, class_names, detected_classes, image_path)


    def track_video(self, video_path: str, save_folder: str, data_file: str):
        video_name: str = FileManager.get_file_name(video_path)
        output_video_path = f'{save_folder}/{video_name}.mp4'

        capture = VideoCapture(video_path)

        frame_width = int(capture.get(CAP_PROP_FRAME_WIDTH))
        frame_height = int(capture.get(CAP_PROP_FRAME_HEIGHT))
        fps = int(capture.get(CAP_PROP_FPS))
        output_video = VideoWriter(output_video_path, VideoWriter_fourcc(*'mp4v'), fps, (frame_width, frame_height))
        
        object_counter: dict[int, set] = {}

        while capture.isOpened():

            success, frame = capture.read()

            if not success:
                break

            results = self.__model.track(frame, persist=True, verbose=False)
            annoteted_frame = results[0].plot()
            output_video.write(annoteted_frame)

            for box in results[0].boxes:
                if box.id is None:
                    continue

                class_id = int(box.cls)
                track_id = int(box.id)

                if class_id not in object_counter:
                    object_counter[class_id] = set()
                object_counter[class_id].add(track_id)


        capture.release()
        output_video.release()

        classes: dict = self.__model.names
        FileManager.save_detection_data(data_file, classes, object_counter, video_path, is_video=True)
