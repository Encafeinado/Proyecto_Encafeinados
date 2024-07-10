import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

interface FileUploadRequest extends Request {
  files: {
    [key: string]: {
      name: string;
      mv: (path: string, callback: (err: any) => void) => void;
    };
  };
}

@Controller('upload')
export class UploadController {
  @Post()
  uploadFile(@Req() req: FileUploadRequest, @Res() res: Response) {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    const file = req.files.file;
    const uploadPath = __dirname + '/uploads/' + file.name;

    file.mv(uploadPath, (err) => {
      if (err) {
        return res.status(500).send(err);
      }

      res.send('File uploaded!');
    });
  }
}
