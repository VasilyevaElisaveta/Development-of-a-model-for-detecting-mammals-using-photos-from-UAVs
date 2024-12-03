from gradio import Interface, File
from model import Model
from file_management import FileManager


class Program:

    def __init__(self) -> None:
        self.__model: Model = Model()
        self.__interface: Interface = Interface(
                title='Детекция млекопитающих',
                fn=self.__process_extension,
                inputs=File(label='Загрузить файл'),
                outputs='file'
            )
        
    @staticmethod
    def __process_exeptions(save_folder: str, input_file_path: str, is_archive_file: bool) -> str | None:
        file_path: str = FileManager.get_error_file(save_folder, input_file_path)
        if not is_archive_file:
            return file_path
        return None
        
    def __process_image(self, input_image_path: str, save_folder: str, data_file: str, is_archive_file: bool) -> str | None:
        self.__model.predict_image(input_image_path, save_folder, data_file)
        if not is_archive_file:
            archive_path: str = FileManager.create_archive(save_folder, input_image_path)
            return archive_path
        return None

    def __process_video(self, input_video_path: str, save_folder: str, data_file: str, is_archive_file: bool) -> str | None:
        self.__model.track_video(input_video_path, save_folder, data_file)
        if not is_archive_file:
            archive_path: str = FileManager.create_archive(save_folder, input_video_path)
            return archive_path
        return None

    def __process_archive(self, input_archive_path: str, save_folder: str, data_file: str) -> str:
        extracted_files: list[tuple[str, str]] = FileManager.unpack_archive(input_archive_path, save_folder)
        
        for new_save_folder, file_path in extracted_files:
            self.__process_extension(file_path, new_save_folder, data_file, is_archive_file=True) 

        archive_path: str = FileManager.create_archive(save_folder, input_archive_path)
        return archive_path

    def __process_extension(self, input_file_path: str, save_folder: str | None = None, data_file: str | None = None, is_archive_file: bool = False) -> File:
        file_extension: str = FileManager.get_file_extension(input_file_path)
        if save_folder is None:
            save_folder: str = FileManager.make_dir(input_file_path)
        if data_file is None:
            data_file = FileManager.create_data_file(save_folder)

        if file_extension in FileManager.get_image_extensions():
            result: str | None = self.__process_image(input_file_path, save_folder, data_file, is_archive_file)
            
        elif file_extension in FileManager.get_video_extensions():
            result: str | None = self.__process_video(input_file_path, save_folder, data_file, is_archive_file)
        
        elif file_extension in FileManager.get_archive_extensions():
            result: str | None = self.__process_archive(input_file_path, save_folder, data_file)

        else:
            result: str | None = self.__process_exeptions(save_folder, input_file_path, is_archive_file)
        
        if result is not None:
            return File(result)
    
    def run(self) -> None:
        self.__interface.launch()


if __name__ == "__main__":
    program = Program()
    program.run()
