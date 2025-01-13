from api.model import Model
from api.file_management import FileManager
from config import models_path


class DetectionInterface:
        
    @staticmethod
    def __process_exeptions(save_folder: str, input_file_path: str, is_archive_file: bool) -> str | None:
        file_path: str = FileManager.get_error_file(save_folder, input_file_path)
        if not is_archive_file:
            return file_path
        return None
    
    @staticmethod    
    def __process_image(model: Model, input_image_path: str, save_folder: str, data_file: str, annotation_data: dict, is_archive_file: bool) -> str | None:
        model.predict_image(input_image_path, save_folder, data_file, annotation_data, is_archive_file)
        if not is_archive_file:
            FileManager.write_annotation_to_json(annotation_data, save_folder)
            archive_path: str = FileManager.create_archive(save_folder, input_image_path)
            return archive_path
        return None

    @staticmethod
    def __process_video(model: Model, input_video_path: str, save_folder: str, data_file: str, is_archive_file: bool) -> str | None:
        model.track_video(input_video_path, save_folder, data_file, is_archive_file)
        if not is_archive_file:
            archive_path: str = FileManager.create_archive(save_folder, input_video_path)
            return archive_path
        return None

    @staticmethod
    def __process_archive(model: Model, input_archive_path: str, save_folder: str, data_file: str, annotation_data: dict) -> str:
        extracted_files: list[tuple[str, str]] = FileManager.unpack_archive(input_archive_path, save_folder)
        
        for new_save_folder, file_path in extracted_files:
            DetectionInterface.__process_extension(file_path, model, new_save_folder, data_file, annotation_data, is_archive_file=True) 

        FileManager.write_annotation_to_json(annotation_data, save_folder)
        archive_path: str = FileManager.create_archive(save_folder, input_archive_path)
        return archive_path

    @staticmethod
    def __process_extension(input_file_path: str, model: Model, save_folder: str | None = None, data_file: str | None = None,
                             annotation_data: dict | None = None, is_archive_file: bool = False) -> str | None:
        file_extension: str = FileManager.get_file_extension(input_file_path)
        if save_folder is None:
            save_folder: str = FileManager.make_dir(input_file_path)
        if data_file is None:
            data_file = FileManager.create_data_file(save_folder)
        if annotation_data is None:
            annotation_data = FileManager.create_annotation_data()

        if file_extension in FileManager.get_image_extensions():
            result: str | None = DetectionInterface.__process_image(model, input_file_path, save_folder, data_file, annotation_data, is_archive_file)
            
        elif file_extension in FileManager.get_video_extensions():
            result: str | None = DetectionInterface.__process_video(model, input_file_path, save_folder, data_file, is_archive_file)
        
        elif file_extension in FileManager.get_archive_extensions():
            result: str | None = DetectionInterface.__process_archive(model, input_file_path, save_folder, data_file, annotation_data)

        else:
            result: str | None = DetectionInterface.__process_exeptions(save_folder, input_file_path, is_archive_file)
        
        if result is None:
            return None
        return result
    
    @staticmethod
    def __prepare_files(file_path: str) -> tuple:
        save_folder: str = FileManager.make_dir(file_path)
        if FileManager.check_file_extension(file_path, is_archive=True):
            files_and_folders: list[tuple[str, str]] = FileManager.unpack_archive(file_path, save_folder)
            files_pathes: list[str] = [x[1] for x in files_and_folders]
        else:
            files_pathes: list[str] = FileManager.prepare_image(file_path)
        preparation_result: tuple = FileManager.prepare_files(files_pathes)

        return preparation_result
    
    @staticmethod
    def __complete_files_editing(image_data: str, class_data: dict) -> str:
        image_data: dict = FileManager.load_json_file(image_data)
        class_data: dict = FileManager.load_json_file(class_data)

        general_save_folder = FileManager.extract_save_path(image_data["1"]["image_path"], only_general_path=True)

        FileManager.process_images(image_data, class_data, general_save_folder)

        source_file_name: str = FileManager.extract_source_file_name(general_save_folder)
        possible_file_name: str = f'{source_file_name}.zip'

        archive_path: str = FileManager.create_archive(general_save_folder, possible_file_name, path_is_relative=True)
        return archive_path
    
    @staticmethod
    def __define_model(class_name: str) -> Model:
        model_path: str = models_path[class_name]
        return Model(model_path)

    @staticmethod
    def run_detection(user_file_path: str, class_name: str) -> str:
        model: Model = DetectionInterface.__define_model(class_name)
        detection_zip_archive: str = DetectionInterface.__process_extension(user_file_path, model)
        return detection_zip_archive

    @staticmethod
    def run_editing_preparation(user_file_path: str) -> tuple:
        result: tuple = DetectionInterface.__prepare_files(user_file_path)
        return result

    @staticmethod
    def run_editing_completion(image_data: str, class_data: str) -> str:
        archive_path: str = DetectionInterface.__complete_files_editing(image_data, class_data)
        return archive_path
    