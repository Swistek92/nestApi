import { EditUserDto } from './../src/user/dto/edit-user.dto';
import { PrismaService } from './../src/prisma/prisma.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('app e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333/');
  });

  // beforeEach(async () => {
  // });
  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'vlasd@srutin.com',
      password: 'smallRu',
    };
    const noEmailDto: AuthDto = {
      email: '',
      password: 'smallRu',
    };
    const noPasswordDto: AuthDto = {
      email: 'vlasd@srutin.com',
      password: '',
    };

    describe('signup', () => {
      it('should signup', async () => {
        return pactum
          .spec()
          .post('auth/signup/')
          .withBody(dto)
          .expectStatus(201);
      });

      it('should throw a err if email is empty', async () => {
        return pactum
          .spec()
          .post('auth/signup/')
          .withBody(noEmailDto)
          .expectStatus(400);
      });
      it('should throw a err if email is empty', async () => {
        return pactum
          .spec()
          .post('auth/signup/')
          .withBody(noPasswordDto)
          .expectStatus(400);
      });
      it('should throw if no body provided', async () => {
        return pactum.spec().post('auth/signup/').expectStatus(400);
      });
    });

    describe('signin', () => {
      it('should signin', async () => {
        return pactum
          .spec()
          .post('auth/signin/')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
      it('should throw if no body provided', async () => {
        return pactum.spec().post('auth/signin/').expectStatus(400);
      });
      it('should throw a error if no password ', async () => {
        return pactum
          .spec()
          .post('auth/signin/')
          .withBody(noPasswordDto)
          .expectStatus(400);
      });
      it('should throw a error if no email ', async () => {
        return pactum
          .spec()
          .post('auth/signin/')
          .withBody(noEmailDto)
          .expectStatus(400);
      });
    });
  });

  describe('User', () => {
    const dto: AuthDto = {
      email: 'vlasd@srutin.com',
      password: 'smallRu',
    };
    describe('Get me', () => {
      it('should take a user', async () => {
        return pactum
          .spec()
          .get('users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .stores('bookmarkId', 'id');
      });
    });

    describe('edit user', () => {
      it('should edit a user', async () => {
        const dto: EditUserDto = {
          email: '123aweq@o2.pl',
          firstName: 'vladimir18',
        };
        return pactum
          .spec()
          .patch('users')
          .withBody(dto)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });
    });
  });
  describe('Bookmarks', () => {
    describe('get empty bookmark', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
    describe('create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'first bookmark',
        link: 'https://www.youtube.com/watch?v=GHTA143_b-s&t=11115s',
      };
      it('should create a bookmark', () => {
        return pactum
          .spec()
          .post('bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.link);
      });
    });
    describe('get bookmarks', () => {
      it('should get  bookmarks', () => {
        return pactum
          .spec()
          .get('bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
    describe('get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });
    describe('edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        description: 'NestJs Course for Beginners - Create a REST API',
        title: 'siala baba maks',
      };
      it('should edit bookmark by id', () => {
        return pactum
          .spec()
          .patch('bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')
          .expectBodyContains(dto.description)
          .expectBodyContains(dto.title);
      });
    });
    describe('Delete bookmark by id', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(403);
      });
    });
  });
});
