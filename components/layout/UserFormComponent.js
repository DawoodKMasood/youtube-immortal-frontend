'use client'

import { useState, useEffect, useRef } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button"
import { Spinner } from "@nextui-org/spinner";
import { Checkbox } from "@nextui-org/checkbox";
import { Progress } from "@nextui-org/progress";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import { useRecoilState } from 'recoil';
import { userState } from '@/states/userState';
import VideoIcon from "../icon/VideoIcon";
import MusicIcon from "../icon/MusicIcon";
import { uploadFile, uploadMusic, processVideo } from '@/services/UploadService';

export default function UserFormComponent() {
  const [userInfo, setUserInfo] = useRecoilState(userState);
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    accountName: '',
    gameMode: '',
    weapon: '',
    mapName: ''
  });
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [musicFile, setMusicFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const videoInputRef = useRef(null);
  const musicInputRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    const initialData = {
      accountName: userInfo?.accountName || '',
      gameMode: userInfo?.gameMode || '',
      weapon: userInfo?.weapon || '',
      mapName: userInfo?.mapName || ''
    };
    setFormData(initialData);

    const isInitiallyComplete = Object.values(initialData).every(value => value.trim().length > 0);
    setIsFormComplete(isInitiallyComplete);
    setIsFormSubmitted(isInitiallyComplete);
  }, [userInfo]);

  useEffect(() => {
    const isComplete = Object.values(formData).every(value => value.trim().length > 0);
    setIsFormComplete(isComplete);
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClick = () => {
    if (isFormComplete) {
      setUserInfo(formData);
      setIsFormSubmitted(true);
    } else {
      showAlert('Please fill in all fields before proceeding.');
    }
  };

  const handleFileUpload = (e, fileType) => {
    const file = e.target.files[0];
    if (fileType === 'video' && file?.type === 'video/mp4') {
      setVideoFile(file);
    } else if (fileType === 'music' && file?.type === 'audio/mpeg') {
      setMusicFile(file);
    } else {
      showAlert(`Please upload a valid ${fileType === 'video' ? '.mp4' : '.mp3'} file`);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e, fileType) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (fileType === 'video' && file.type === 'video/mp4') {
      setVideoFile(file);
    } else if (fileType === 'music' && file.type === 'audio/mpeg') {
      setMusicFile(file);
    } else {
      showAlert(`Please upload a valid ${fileType === 'video' ? '.mp4' : '.mp3'} file`);
    }
  };

  const handleUpload = async () => {
    if (!videoFile) {
      showAlert('Please select a video file to upload.');
      return;
    }
  
    setUploadStatus('uploading');
    setUploadProgress(0);
    setIsProgressModalOpen(true);
  
    try {
      let musicFilename = null;
      const hasMusicFile = !!musicFile;
      const musicProgressWeight = hasMusicFile ? 0.3 : 0;
      const videoProgressWeight = 1 - musicProgressWeight;
  
      if (hasMusicFile) {
        musicFilename = await uploadMusic(musicFile, (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted * musicProgressWeight);
        });
      }
  
      const videoUploadResult = await uploadFile({
        file: videoFile,
        accountName: formData.accountName,
        gameMode: formData.gameMode,
        weapon: formData.weapon,
        mapName: formData.mapName,
        backgroundMusicFilename: musicFilename,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          const baseProgress = hasMusicFile ? musicProgressWeight * 100 : 0;
          setUploadProgress(baseProgress + percentCompleted * videoProgressWeight);
        },
      });
  
      await processVideo(videoUploadResult.filename, musicFilename);
  
      setUploadStatus('success');
      showAlert('Upload and processing completed successfully!');
      setTimeout(() => {
        resetForm();
      }, 3000);
    } catch (error) {
      console.error('Upload or processing failed:', error);
      setUploadStatus('error');
      showAlert('Upload or processing failed. Please try again.');
    } finally {
      setIsProgressModalOpen(false);
    }
  };

  const resetForm = () => {
    setFormData({
      accountName: userInfo.accountName,
      gameMode: '',
      weapon: '',
      mapName: ''
    });
    setUserInfo({
      accountName: userInfo.accountName,
      gameMode: '',
      weapon: '',
      mapName: ''
    })
    setVideoFile(null);
    setMusicFile(null);
    setIsSelected(false);
    setIsFormSubmitted(false);
    setUploadStatus('');
    setUploadProgress(0);
    setIsAlertModalOpen(false);
  };

  const showAlert = (message) => {
    setAlertMessage(message);
    setIsAlertModalOpen(true);
  };

  if (!isClient) {
    return (
      <div className="flex flex-col items-center gap-5 w-full">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (isFormSubmitted && isFormComplete) return (
    <div className='flex flex-col gap-5 w-full'>
      <div 
        className="border-2 border-gray-700 border-dashed py-8 px-5 w-full rounded-xl cursor-pointer bg-black/10"
        onClick={() => videoInputRef.current.click()}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'video')}
      >
        <input
          type="file"
          ref={videoInputRef}
          onChange={(e) => handleFileUpload(e, 'video')}
          accept=".mp4"
          style={{ display: 'none' }}
        />
        <div className="flex flex-col gap-3 items-center justify-center">
          <VideoIcon />
          {!videoFile && (
            <div className="flex flex-col gap-1">
              <div className="text-center">
                <span className="text-blue-500">Upload a file</span> or drag and drop
              </div>
              <span className="block text-sm text-gray-400 text-center">
                (Only .mp4 is allowed for upload)
              </span>
            </div>
          )}
          {videoFile && <p className="mt-2 text-lg text-blue-400 truncate max-w-64 lg:max-w-96">{videoFile.name}</p>}
        </div>
      </div>
      <Checkbox isSelected={isSelected} onValueChange={setIsSelected}>
        Click to upload your own music
      </Checkbox>
      {isSelected && (
        <div 
          className="border-2 border-gray-700 border-dashed py-8 px-5 w-full rounded-xl cursor-pointer bg-black/10"
          onClick={() => musicInputRef.current.click()}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'music')}
        >
          <input
            type="file"
            ref={musicInputRef}
            onChange={(e) => handleFileUpload(e, 'music')}
            accept=".mp3"
            style={{ display: 'none' }}
          />
          <div className="flex flex-col gap-3 items-center justify-center">
            <MusicIcon />
            {!musicFile && (
              <div className="flex flex-col gap-1">
                <div className="text-center">
                  <span className="text-blue-500">Upload a file</span> or drag and drop
                </div>
                <span className="block text-sm text-gray-400 text-center">
                  (Only .mp3 is allowed for upload)
                </span>
              </div>
            )}
            {musicFile && <p className="mt-2 text-lg text-blue-400 truncate max-w-64 lg:max-w-96">{musicFile.name}</p>}
          </div>
        </div>
      )}
      <Button 
        className="cursor-pointer"
        color="primary" 
        size="lg" 
        variant="flat" 
        onClick={handleUpload}
        disabled={!videoFile || uploadStatus === 'uploading'}
      >
        {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Files'}
      </Button>

      {/* Progress Modal */}
      <Modal 
        isOpen={isProgressModalOpen} 
        onClose={() => {}} 
        isDismissable={false}
        hideCloseButton
      >
        <ModalContent>
          <ModalHeader>Upload Progress</ModalHeader>
          <ModalBody>
            <Progress
              size="md"
              value={uploadProgress}
              color="primary"
              showValueLabel={true}
              className="max-w-md"
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Alert Modal */}
      <Modal 
        isOpen={isAlertModalOpen} 
        onClose={() => setIsAlertModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>Alert</ModalHeader>
          <ModalBody>
            <p>{alertMessage}</p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsAlertModalOpen(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );

  return (
    <div className='flex flex-col gap-5 w-full'>
      <Input required value={formData.accountName} type="text" label="Account Name" name="accountName" onChange={handleInputChange} />
      <Input required value={formData.gameMode} type="text" label="Game Mode" name="gameMode" onChange={handleInputChange} />
      <Input required value={formData.weapon} type="text" label="Weapon" name="weapon" onChange={handleInputChange} />
      <Input required value={formData.mapName} type="text" label="Map Name" name="mapName" onChange={handleInputChange} />
      <Button className="cursor-pointer" color="primary" size="lg" onClick={handleClick} disabled={!isFormComplete} variant="flat">
        Next
      </Button>
    </div>
  );
}