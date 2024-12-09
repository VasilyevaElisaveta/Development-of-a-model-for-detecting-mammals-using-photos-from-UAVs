from api.model import Model
from api.file_management import FileManager


class DetectionInterface:
        
    @staticmethod
    def __process_exeptions(save_folder: str, input_file_path: str, is_archive_file: bool) -> str | None:
        file_path: str = FileManager.get_error_file(save_folder, input_file_path)
        if not is_archive_file:
            return file_path
        return None
    
    @staticmethod    
    def __process_image(input_image_path: str, save_folder: str, data_file: str, is_archive_file: bool) -> str | None:
        model: Model = Model()
        model.predict_image(input_image_path, save_folder, data_file)
        if not is_archive_file:
            archive_path: str = FileManager.create_archive(save_folder, input_image_path)
            return archive_path
        return None

    @staticmethod
    def __process_video(input_video_path: str, save_folder: str, data_file: str, is_archive_file: bool) -> str | None:
        model: Model = Model()
        model.track_video(input_video_path, save_folder, data_file)
        if not is_archive_file:
            archive_path: str = FileManager.create_archive(save_folder, input_video_path)
            return archive_path
        return None

    @staticmethod
    def __process_archive(input_archive_path: str, save_folder: str, data_file: str) -> str:
        extracted_files: list[tuple[str, str]] = FileManager.unpack_archive(input_archive_path, save_folder)
        
        for new_save_folder, file_path in extracted_files:
            DetectionInterface.__process_extension(file_path, new_save_folder, data_file, is_archive_file=True) 

        archive_path: str = FileManager.create_archive(save_folder, input_archive_path)
        return archive_path

    @staticmethod
    def __process_extension(input_file_path: str, save_folder: str | None = None, data_file: str | None = None, is_archive_file: bool = False) -> str | None:
        file_extension: str = FileManager.get_file_extension(input_file_path)
        if save_folder is None:
            save_folder: str = FileManager.make_dir(input_file_path)
        if data_file is None:
            data_file = FileManager.create_data_file(save_folder)

        if file_extension in FileManager.get_image_extensions():
            result: str | None = DetectionInterface.__process_image(input_file_path, save_folder, data_file, is_archive_file)
            
        elif file_extension in FileManager.get_video_extensions():
            result: str | None = DetectionInterface.__process_video(input_file_path, save_folder, data_file, is_archive_file)
        
        elif file_extension in FileManager.get_archive_extensions():
            result: str | None = DetectionInterface.__process_archive(input_file_path, save_folder, data_file)

        else:
            result: str | None = DetectionInterface.__process_exeptions(save_folder, input_file_path, is_archive_file)
        
        if result is None:
            return None
        return result
    
    @staticmethod
    def run(user_file_path: str) -> str:
        detection_zip_archive: str = DetectionInterface.__process_extension(user_file_path)
        return detection_zip_archive


