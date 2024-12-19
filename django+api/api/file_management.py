from os import makedirs, walk, path
from zipfile import ZipFile, ZIP_DEFLATED
from numpy import ndarray
from cv2 import imwrite, IMWRITE_JPEG_QUALITY
from json import dump
from shutil import copyfileobj
from config import MEDIA_DIR_RESULT_FILES


class FileManager:
    __IMAGE_EXTENSIONS: list[str] = ['png', 'jpg', 'jpeg', 'bmp', 'webp', 'tiff', 'tif']
    __VIDEO_EXTENSIONS: list[str] = ['mp4', 'asf', 'avi', 'm4v', 'mkv', 'mov', 'mpeg', 'mpg', 'ts', 'wmv', 'webm']
    __ARCHIVE_EXTENSIONS: list[str] = ['zip']
    __RESULT_FOLDER: str = MEDIA_DIR_RESULT_FILES

    @staticmethod
    def get_supported_file_extensions_message() -> str:
        supported_image_extensions: str = f'Image extensions: {', '.join(FileManager.__IMAGE_EXTENSIONS)}'
        supported_video_extensions: str = f'Video extensions: {', '.join(FileManager.__VIDEO_EXTENSIONS)}'
        supported_archive_extensions: str = f'Archive extensions: {', '.join(FileManager.__ARCHIVE_EXTENSIONS)}'
        #result_string: str = f'Files are supported only with the following extensions. \n{supported_image_extensions}. \n{supported_video_extensions}. \n{supported_archive_extensions}.'
        result_string: str = f'Files extensions is unsupport.'
        return result_string
    
    @staticmethod
    def check_file_extension(file_path: str, is_archive: bool = False) -> bool:
        file_extension: str = FileManager.get_file_extension(file_path)
        extension_is_correct: bool = True
        if is_archive:
            extension_is_correct = False if file_extension not in FileManager.__ARCHIVE_EXTENSIONS else True
        else:
            extension_is_correct = False if (file_extension not in FileManager.__IMAGE_EXTENSIONS and
                                            file_extension not in FileManager.__VIDEO_EXTENSIONS and
                                            file_extension not in FileManager.__ARCHIVE_EXTENSIONS) else True
        return extension_is_correct
    

    @staticmethod
    def get_supported_file_extensions() -> list[str]:
        return FileManager.__IMAGE_EXTENSIONS + FileManager.__VIDEO_EXTENSIONS + FileManager.__ARCHIVE_EXTENSIONS

    @staticmethod
    def get_file_name(file_path: str) -> str:
        file_name: str = file_path.split('\\')[-1].split('.')[0]
        return file_name
    
    @staticmethod
    def get_file_extension(file_path: str) -> str:
        return file_path.split('.')[-1].lower()

    @staticmethod
    def make_dir(file_path: str) -> str:
        file_name = FileManager.get_file_name(file_path)
        directory_path: str = path.join(FileManager.__RESULT_FOLDER, file_name, 'files')
        makedirs(directory_path, exist_ok=True)
        return directory_path
    
    @staticmethod
    def save_file(file, file_path: str):
        with open(file_path, "wb") as f:
            copyfileobj(file.file, f)
    
    @staticmethod
    def save_annotation_data(annotation_data: dict, image_path: str,  image_shape: tuple[int, int],
                                coordinates: list[list[float]], classes: list[int], class_definition: dict[int, str]):
        
        def update_image_data(annotation_data:dict, image_path: str, image_shape: tuple[int, int]) -> int:
            image_name: str = FileManager.get_file_name(image_path) + "." + FileManager.get_file_extension(image_path)
            if image_name in annotation_data["info"]["images"]:
                image_id: int = annotation_data["info"]["images"][image_name]
            else:
                annotation_data["info"]["last_image_id"] += 1
                image_id = annotation_data["info"]["last_image_id"]
                annotation_data["info"]["images"][image_name] = image_id

                annotation_data["main_data"]["images"].append(
                    {
                        "id": image_id,
                        "file_name": image_name,
                        "width": image_shape[1],
                        "height": image_shape[0]
                    }
                )
            return image_id

        def update_categories_data(annotation_data: dict, current_class: int, class_definition: dict[int, str]) -> int:
            class_name: str = class_definition[current_class]
            if class_name in annotation_data["info"]["categories"]:
                class_id: int =  annotation_data["info"]["categories"][class_name]
            else:
                annotation_data["info"]["last_category_id"] += 1
                class_id: int = annotation_data["info"]["last_category_id"]
                annotation_data["info"]["categories"][class_name] = class_id

                annotation_data["main_data"]["categories"].append(
                    {
                        "id": class_id,
                        "name": class_name
                    }
                )
            return class_id
        
        def update_annotations_data(annotation_data: dict, image_id: int, category_id: int, coordinates: list[float]):

            def get_annotation_id(annotation_data: dict) -> int:
                annotation_data["info"]["last_annotation_id"] += 1
                return annotation_data["info"]["last_annotation_id"]

            annotation_id = get_annotation_id(annotation_data)
            x1, y1, x2, y2 = coordinates
            width: float = x2 - x1
            height: float = y2 - y1
            area: float = width * height

            annotation_data["main_data"]["annotations"].append(
                {
                    "id": annotation_id,
                    "image_id": image_id,
                    "category_id": category_id,
                    "bbox": [x1, y1, width, height],
                    "segmentation": [[x1, y1, x2, y1, x2, y2, x1, y2]],
                    "area": area,
                    "iscrowd": 0
                }
            )
        
        image_id: int = update_image_data(annotation_data, image_path, image_shape)
        for i in range(len(coordinates)):
            current_class: int = classes[i]
            class_id: int = update_categories_data(annotation_data, current_class, class_definition)
            current_coordinates: list[float] = coordinates[i]
            update_annotations_data(annotation_data, image_id, class_id, current_coordinates)
    
    @staticmethod
    def create_annotation_data() -> dict:
        annotation_data = {
            "info" : {
                "last_image_id" : 0,
                "last_annotation_id" : 0,
                "last_category_id" : 0,
                "images" : {},
                "categories" : {}
            },
            "main_data" : {
                "images" : [],
                "annotations" : [],
                "categories" : []
            }
        }
        return annotation_data
    
    @staticmethod
    def write_annotation_to_json(annotation_data: dict, save_path: str):
        file_path: str = path.join(save_path, "annotation.json")
        with open(file_path, 'w') as output_file:
            dump(annotation_data["main_data"], output_file, indent=2)
    
    @staticmethod
    def create_data_file(save_folder: str) -> str:
        file_path: str = f'{save_folder}/data.txt'
        # file_path: str = path.join(save_folder, 'data.txt')
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
                    # class_name = classes[int(class_id)]
                    class_name = 'deer'
                    data_file.write(f'{class_name}: {len(objects)}\n')
            else:
                for class_id, count in amount.items():
                    # class_name = classes[int(class_id)]
                    class_name = 'deer'
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
