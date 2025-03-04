from os import makedirs, walk, path
from zipfile import ZipFile, ZIP_DEFLATED
from numpy import ndarray
from cv2 import imwrite, IMWRITE_JPEG_QUALITY


class FileManager:
    __IMAGE_EXTENSIONS = ['png', 'jpg']
    __VIDEO_EXTENSIONS = ['mp4']
    __ARCHIVE_EXTENSIONS = ['zip']
    __RESULT_FOLDER = 'results'

    @staticmethod
    def get_file_name(file_path: str) -> str:
        file_name: str = file_path.split('\\')[-1].split('.')[0]
        return file_name
    
    @staticmethod
    def get_file_extension(file_path: str) -> str:
        return file_path.split('.')[-1]

    @staticmethod
    def make_dir(file_path: str) -> str:
        file_name = FileManager.get_file_name(file_path)
        directory_path: str = f'{FileManager.__RESULT_FOLDER}/{file_name}/files'
        makedirs(directory_path, exist_ok=True)
        return directory_path
    
    @staticmethod
    def create_data_file(save_folder: str) -> str:
        file_path: str = f'{save_folder}/data.txt'
        with open(file_path, 'w') as data_file:
            pass
        return file_path
    
    @staticmethod
    def create_archive(general_folder: str, file_path: str) -> str:
        file_name: str = FileManager.get_file_name(file_path)
        archive_path: str = f'{FileManager.__RESULT_FOLDER}/{file_name}/{file_name}.zip'
        with ZipFile(archive_path, 'w', ZIP_DEFLATED) as zip_archive:
            for root, dirs, files in walk(general_folder):
                for file in files:
                    full_path = path.join(root, file)
                    arcname = path.relpath(full_path, general_folder)
                    zip_archive.write(full_path, arcname)
        return archive_path
    
    @staticmethod
    def save_image(image: ndarray, image_path: str, save_folder: str):
        image_name: str = FileManager.get_file_name(image_path)
        image_extension: str = FileManager.get_file_extension(image_name)
        save_path: str = f'{save_folder}/{image_name}'
        if image_extension == 'png':
            imwrite(f'{save_path}.{image_extension}', image)
        else:
            imwrite(f'{save_path}.jpg', image, [IMWRITE_JPEG_QUALITY, 90])

    @staticmethod
    def save_detection_data(file: str, classes: dict, amount: dict, file_path: str, is_video: bool = False):
        image_name: str = FileManager.get_file_name(file_path)
        with open(file, 'a+') as data_file:
            data_file.write(f'{image_name}\n')
            if is_video:
                for class_id, objects in amount.items():
                    class_name = classes[int(class_id)]
                    data_file.write(f'{class_name}: {len(objects)}\n')
            else:
                for class_id, count in amount.items():
                    class_name = classes[int(class_id)]
                    data_file.write(f'{class_name}: {count}\n')

    @staticmethod
    def get_error_file(save_folder: str, file_path: str) -> str:
        file_name: str = FileManager.get_file_name(file_path)
        file_extension = FileManager.get_file_extension(file_path)
        error_file_path: str = f'{save_folder}/errors.txt'
        with open(error_file_path, 'a+') as error_file:
            error_file.write(f'{file_name}.{file_extension} - Unsupportable file extension\n')
        return error_file_path
    
    @staticmethod
    def unpack_archive(archive_path: str, save_folder: str) -> list[tuple[str, str]]:
        archive_name: str = FileManager.get_file_name(archive_path)
        archive_extraction_folder: str = f'{FileManager.__RESULT_FOLDER}/{archive_name}/source'

        with ZipFile(archive_path, 'r') as zip_archive:
            zip_archive.extractall(archive_extraction_folder)

        extracted_files: list[tuple[str, str]] = []
        for root, dirs, files in walk(archive_extraction_folder):
            for file_name in files:
                source_file_path: str = path.join(root, file_name)
                relative_path = path.relpath(root, archive_extraction_folder)
                save_subfolder = path.join(save_folder, relative_path)
                makedirs(save_subfolder, exist_ok=True)
                extracted_files.append((save_subfolder, source_file_path))

        return extracted_files
    
    @staticmethod
    def get_image_extensions() -> list[str]:
        return FileManager.__IMAGE_EXTENSIONS
    
    @staticmethod
    def get_video_extensions() -> list[str]:
        return FileManager.__VIDEO_EXTENSIONS
    
    @staticmethod
    def get_archive_extensions() -> list[str]:
        return FileManager.__ARCHIVE_EXTENSIONS
    